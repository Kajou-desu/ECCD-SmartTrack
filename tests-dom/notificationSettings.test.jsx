import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// NotificationSettings: the Email and SMS switches are real server-side
// preferences (they decide what the backend sends), and the Push switch
// reflects whether THIS browser is subscribed — none of it is local-only state.
const apiMock = vi.hoisted(() => ({
  getNotificationPreferences: vi.fn(),
  updateNotificationPreferences: vi.fn(),
  getPushPublicKey: vi.fn(),
  subscribePush: vi.fn(),
  unsubscribePush: vi.fn(),
}));
const pushMock = vi.hoisted(() => ({
  isPushSupported: vi.fn(),
  getPushPermission: vi.fn(),
  getDeviceSubscription: vi.fn(),
  subscribeDevice: vi.fn(),
  PushPermissionError: class PushPermissionError extends Error {},
}));
const toastMock = vi.hoisted(() => vi.fn());
const authState = vi.hoisted(() => ({ value: { user: { id: 1 } } }));

vi.mock("@api/client.js", () => ({ apiClient: apiMock }));
vi.mock("@hooks/useAuth.js", () => ({ useAuth: () => authState.value }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toastMock }));
vi.mock("@utils/pushNotifications.js", () => pushMock);

const { default: NotificationSettings } = await import(
  "@features/settings/components/NotificationSettings.jsx"
);

function renderSettings(client) {
  return render(
    <QueryClientProvider client={client}>
      <NotificationSettings />
    </QueryClientProvider>,
  );
}

let client;
beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  authState.value = { user: { id: 1 } };
  // Email/SMS tests don't care about push: an unsupported browser keeps that switch inert.
  pushMock.isPushSupported.mockReturnValue(false);
  pushMock.getPushPermission.mockReturnValue("default");
  pushMock.getDeviceSubscription.mockResolvedValue(null);
  apiMock.getPushPublicKey.mockResolvedValue({ publicKey: "PUB-KEY" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("NotificationSettings", () => {
  it("shows the saved email and SMS preferences from the server", async () => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: false });

    renderSettings(client);

    const email = await screen.findByRole("switch", { name: /email notifications/i });
    const sms = screen.getByRole("switch", { name: /sms notifications/i });
    expect(email.checked).toBe(true);
    expect(sms.checked).toBe(false);
  });

  it("saves only the toggled channel", async () => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: true });
    apiMock.updateNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: false });

    renderSettings(client);
    const sms = await screen.findByRole("switch", { name: /sms notifications/i });

    fireEvent.click(sms);

    await waitFor(() => expect(sms.checked).toBe(false)); // optimistic
    expect(apiMock.updateNotificationPreferences).toHaveBeenCalledTimes(1);
    expect(apiMock.updateNotificationPreferences.mock.calls[0][0]).toEqual({ notifyBySms: false });
  });

  it("confirms a successful save with a success toast naming the channel and its new state", async () => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: true });
    apiMock.updateNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: false });

    renderSettings(client);
    fireEvent.click(await screen.findByRole("switch", { name: /sms notifications/i }));

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith("success", "SMS notifications turned off."));
  });

  it("does not show a success toast when the save fails", async () => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: true });
    apiMock.updateNotificationPreferences.mockRejectedValue(new Error("boom"));

    renderSettings(client);
    fireEvent.click(await screen.findByRole("switch", { name: /email notifications/i }));

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith("error", expect.any(String)));
    expect(toastMock).not.toHaveBeenCalledWith("success", expect.any(String));
  });

  it("tells the user and re-syncs from the server when saving fails", async () => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: true });
    apiMock.updateNotificationPreferences.mockRejectedValue(new Error("boom"));

    renderSettings(client);
    const email = await screen.findByRole("switch", { name: /email notifications/i });

    fireEvent.click(email);

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith("error", expect.stringMatching(/couldn't save/i)));
    // The server still says "on", so the switch must not be left showing "off".
    await waitFor(() => expect(apiMock.getNotificationPreferences.mock.calls.length).toBeGreaterThan(1));
    await waitFor(() => expect(email.checked).toBe(true));
  });

  it("offers a retry instead of guessing when the preferences can't be loaded", async () => {
    apiMock.getNotificationPreferences.mockRejectedValueOnce(new Error("down"));
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: false, notifyBySms: true });

    renderSettings(client);

    // No switches are shown with made-up values while the load has failed.
    fireEvent.click(await screen.findByRole("button", { name: /try again/i }));

    const email = await screen.findByRole("switch", { name: /email notifications/i });
    expect(email.checked).toBe(false);
  });

  it("does not request anything without a signed-in user", async () => {
    authState.value = { user: null };

    renderSettings(client);
    await new Promise((r) => setTimeout(r, 0));

    expect(apiMock.getNotificationPreferences).not.toHaveBeenCalled();
  });
});

describe("NotificationSettings — push", () => {
  const SUBSCRIPTION = { endpoint: "https://fcm.googleapis.com/fcm/send/abc", keys: { p256dh: "P", auth: "A" } };

  beforeEach(() => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: true });
    pushMock.isPushSupported.mockReturnValue(true);
  });

  async function pushSwitch() {
    const toggle = await screen.findByRole("switch", { name: /push notifications/i });
    return toggle;
  }

  it("is switched off and disabled with an explanation when the browser can't do push", async () => {
    pushMock.isPushSupported.mockReturnValue(false);

    renderSettings(client);
    const toggle = await pushSwitch();

    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(true);
    expect(screen.getByText(/not supported in this browser/i)).toBeTruthy();
    expect(apiMock.getPushPublicKey).not.toHaveBeenCalled();
  });

  it("is disabled when the server has no push keys configured", async () => {
    apiMock.getPushPublicKey.mockResolvedValue({ publicKey: null });

    renderSettings(client);

    await waitFor(() => expect(screen.getByText(/aren't available right now/i)).toBeTruthy());
    expect((await pushSwitch()).disabled).toBe(true);
  });

  it("is disabled with instructions when notifications are blocked in the browser", async () => {
    pushMock.getPushPermission.mockReturnValue("denied");

    renderSettings(client);

    await waitFor(() => expect(screen.getByText(/blocked in your browser settings/i)).toBeTruthy());
    expect((await pushSwitch()).disabled).toBe(true);
  });

  it("shows the switch on when this device is already subscribed", async () => {
    pushMock.getDeviceSubscription.mockResolvedValue({ ...SUBSCRIPTION, unsubscribe: vi.fn() });

    renderSettings(client);
    const toggle = await pushSwitch();

    await waitFor(() => expect(toggle.checked).toBe(true));
  });

  it("subscribes this device, registers it with the server and confirms with a toast", async () => {
    pushMock.subscribeDevice.mockResolvedValue(SUBSCRIPTION);
    apiMock.subscribePush.mockResolvedValue({ subscribed: true });

    renderSettings(client);
    const toggle = await pushSwitch();
    await waitFor(() => expect(toggle.disabled).toBe(false));

    fireEvent.click(toggle);

    await waitFor(() => expect(toggle.checked).toBe(true));
    expect(pushMock.subscribeDevice).toHaveBeenCalledWith("PUB-KEY");
    expect(apiMock.subscribePush).toHaveBeenCalledWith(SUBSCRIPTION);
    expect(toastMock).toHaveBeenCalledWith("success", "Push notifications turned on for this device.");
  });

  it("stays off and explains when the user declines the browser prompt", async () => {
    pushMock.subscribeDevice.mockRejectedValue(new pushMock.PushPermissionError());

    renderSettings(client);
    const toggle = await pushSwitch();
    await waitFor(() => expect(toggle.disabled).toBe(false));

    fireEvent.click(toggle);

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith("warning", expect.stringMatching(/blocked/i)));
    expect(apiMock.subscribePush).not.toHaveBeenCalled();
    expect(toggle.checked).toBe(false);
  });

  it("undoes the browser subscription and reports an error if the server rejects it", async () => {
    const browserSub = { ...SUBSCRIPTION, unsubscribe: vi.fn().mockResolvedValue(true) };
    pushMock.subscribeDevice.mockResolvedValue(SUBSCRIPTION);
    pushMock.getDeviceSubscription.mockResolvedValueOnce(null).mockResolvedValue(browserSub);
    apiMock.subscribePush.mockRejectedValue(new Error("boom"));

    renderSettings(client);
    const toggle = await pushSwitch();
    await waitFor(() => expect(toggle.disabled).toBe(false));

    fireEvent.click(toggle);

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith("error", expect.stringMatching(/turn on push/i)));
    expect(browserSub.unsubscribe).toHaveBeenCalled();
    expect(toggle.checked).toBe(false);
    expect(toastMock).not.toHaveBeenCalledWith("success", expect.any(String));
  });

  it("turns push off for this device: server first, then the browser, then a toast", async () => {
    const order = [];
    const browserSub = { ...SUBSCRIPTION, unsubscribe: vi.fn(async () => { order.push("browser"); return true; }) };
    pushMock.getDeviceSubscription.mockResolvedValue(browserSub);
    apiMock.unsubscribePush.mockImplementation(async () => { order.push("server"); });

    renderSettings(client);
    const toggle = await pushSwitch();
    await waitFor(() => expect(toggle.checked).toBe(true));

    fireEvent.click(toggle);

    await waitFor(() => expect(toggle.checked).toBe(false));
    expect(apiMock.unsubscribePush).toHaveBeenCalledWith(SUBSCRIPTION.endpoint);
    expect(order).toEqual(["server", "browser"]);
    expect(toastMock).toHaveBeenCalledWith("success", "Push notifications turned off for this device.");
  });

  it("keeps push on and reports an error if the server can't be told", async () => {
    const browserSub = { ...SUBSCRIPTION, unsubscribe: vi.fn() };
    pushMock.getDeviceSubscription.mockResolvedValue(browserSub);
    apiMock.unsubscribePush.mockRejectedValue(new Error("boom"));

    renderSettings(client);
    const toggle = await pushSwitch();
    await waitFor(() => expect(toggle.checked).toBe(true));

    fireEvent.click(toggle);

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith("error", expect.stringMatching(/turn off push/i)));
    expect(browserSub.unsubscribe).not.toHaveBeenCalled();
    expect(toggle.checked).toBe(true);
  });
});
