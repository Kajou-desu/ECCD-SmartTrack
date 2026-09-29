import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PushPermissionError,
  getDeviceSubscription,
  getPushPermission,
  isPushSupported,
  subscribeDevice,
} from "@utils/pushNotifications.js";

// jsdom has no service worker / Push API, so the browser pieces are stubbed
// and these tests pin down what we ask of the browser, and in what order.
function stubBrowser({ permission = "granted", existing = null } = {}) {
  const subscription = {
    toJSON: () => ({ endpoint: "https://fcm.googleapis.com/x", expirationTime: null, keys: { p256dh: "P", auth: "A" } }),
  };
  const pushManager = {
    getSubscription: vi.fn().mockResolvedValue(existing),
    subscribe: vi.fn().mockResolvedValue(subscription),
  };
  const registration = { pushManager };
  const calls = [];

  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      register: vi.fn(async (url) => { calls.push(`register:${url}`); return registration; }),
      ready: Promise.resolve(registration),
      getRegistration: vi.fn().mockResolvedValue(registration),
    },
  });
  vi.stubGlobal("PushManager", function PushManager() {});
  vi.stubGlobal("Notification", {
    permission: "default",
    requestPermission: vi.fn(async () => { calls.push("permission"); return permission; }),
  });
  return { pushManager, registration, calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete navigator.serviceWorker;
});

describe("isPushSupported / getPushPermission", () => {
  it("is false when the browser has no service worker or Push API", () => {
    expect(isPushSupported()).toBe(false);
  });

  it("is true when service worker, Push API and Notification all exist", () => {
    stubBrowser();
    expect(isPushSupported()).toBe(true);
  });

  it("reports the browser's permission state", () => {
    stubBrowser();
    Notification.permission = "denied";
    expect(getPushPermission()).toBe("denied");
  });
});

describe("subscribeDevice", () => {
  it("asks for permission FIRST (it must run inside the click), then registers /sw.js and subscribes", async () => {
    const { pushManager, calls } = stubBrowser();

    const result = await subscribeDevice("AQI"); // 2 bytes, needs base64 padding

    expect(calls).toEqual(["permission", "register:/sw.js"]);
    expect(pushManager.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: Uint8Array.from([1, 2]),
    });
    // Only what the backend needs — no expirationTime.
    expect(result).toEqual({ endpoint: "https://fcm.googleapis.com/x", keys: { p256dh: "P", auth: "A" } });
  });

  it("decodes a real-length URL-safe VAPID key to its 65 raw bytes", async () => {
    const { pushManager } = stubBrowser();
    const raw = Uint8Array.from({ length: 65 }, (_, i) => (i * 7 + 250) % 256); // includes bytes that encode to - and _
    const key = btoa(String.fromCharCode(...raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    await subscribeDevice(key);

    expect(pushManager.subscribe.mock.calls[0][0].applicationServerKey).toEqual(raw);
  });

  it("does nothing further and throws PushPermissionError when permission is not granted", async () => {
    const { pushManager } = stubBrowser({ permission: "denied" });

    await expect(subscribeDevice("AQI")).rejects.toBeInstanceOf(PushPermissionError);

    expect(navigator.serviceWorker.register).not.toHaveBeenCalled();
    expect(pushManager.subscribe).not.toHaveBeenCalled();
  });

  it("drops an old subscription first (e.g. made before a server key change)", async () => {
    const old = { unsubscribe: vi.fn().mockResolvedValue(true) };
    const { pushManager } = stubBrowser({ existing: old });

    await subscribeDevice("AQI");

    expect(old.unsubscribe).toHaveBeenCalledTimes(1);
    expect(old.unsubscribe.mock.invocationCallOrder[0]).toBeLessThan(pushManager.subscribe.mock.invocationCallOrder[0]);
  });
});

describe("getDeviceSubscription", () => {
  it("returns null when push isn't supported", async () => {
    expect(await getDeviceSubscription()).toBeNull();
  });

  it("returns null when the service worker was never registered", async () => {
    stubBrowser();
    navigator.serviceWorker.getRegistration.mockResolvedValue(undefined);
    expect(await getDeviceSubscription()).toBeNull();
  });

  it("returns this browser's existing subscription", async () => {
    const existing = { endpoint: "https://fcm.googleapis.com/x" };
    stubBrowser({ existing });
    expect(await getDeviceSubscription()).toBe(existing);
  });
});

// public/sw.js is plain script run by the browser, so load its source and
// drive its two event handlers with a fake service-worker scope.
describe("public/sw.js", () => {
  const source = readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/sw.js"),
    "utf8",
  );
  let handlers;
  let scope;

  beforeEach(() => {
    handlers = {};
    scope = {
      addEventListener: (type, fn) => { handlers[type] = fn; },
      registration: { showNotification: vi.fn().mockResolvedValue(undefined) },
      clients: { matchAll: vi.fn(), openWindow: vi.fn().mockResolvedValue(undefined) },
    };
    new Function("self", source)(scope);
  });

  function pushEvent(data) {
    const waits = [];
    return { data, waitUntil: (p) => waits.push(p), waits };
  }

  it("shows the title and body from the payload as plain text", async () => {
    const event = pushEvent({ json: () => ({ title: "Arrival", body: "Ana arrived at school at 7:40 AM." }) });

    handlers.push(event);
    await Promise.all(event.waits);

    expect(scope.registration.showNotification).toHaveBeenCalledWith("Arrival", {
      body: "Ana arrived at school at 7:40 AM.",
    });
  });

  it("falls back to a generic notification for a missing or malformed payload", async () => {
    for (const data of [null, { json: () => { throw new SyntaxError("bad json"); } }, { json: () => ({ title: 5, body: {} }) }]) {
      scope.registration.showNotification.mockClear();
      const event = pushEvent(data);

      handlers.push(event);
      await Promise.all(event.waits);

      expect(scope.registration.showNotification).toHaveBeenCalledWith("ECCD SmartTrack", { body: "" });
    }
  });

  it("focuses an already-open app tab on click", async () => {
    const focus = vi.fn().mockResolvedValue(undefined);
    scope.clients.matchAll.mockResolvedValue([{ focus }]);
    const close = vi.fn();
    const waits = [];

    handlers.notificationclick({ notification: { close }, waitUntil: (p) => waits.push(p) });
    await Promise.all(waits);

    expect(close).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
    expect(scope.clients.openWindow).not.toHaveBeenCalled();
  });

  it("opens the app on click when no tab is open", async () => {
    scope.clients.matchAll.mockResolvedValue([]);
    const waits = [];

    handlers.notificationclick({ notification: { close: vi.fn() }, waitUntil: (p) => waits.push(p) });
    await Promise.all(waits);

    expect(scope.clients.openWindow).toHaveBeenCalledWith("/");
  });
});
