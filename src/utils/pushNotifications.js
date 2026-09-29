// Browser side of Web Push: permission, service worker and this device's
// subscription. Talking to the backend is left to the caller.

export class PushPermissionError extends Error {
  constructor() {
    super("Notification permission was not granted");
    this.name = "PushPermissionError";
  }
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// The browser's own permission state: "default", "granted" or "denied".
export function getPushPermission() {
  return typeof Notification === "undefined" ? "denied" : Notification.permission;
}

// The push subscription of THIS browser, or null if it has none.
export async function getDeviceSubscription() {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  return registration ? registration.pushManager.getSubscription() : null;
}

// The server's VAPID key is base64url; pushManager.subscribe wants raw bytes.
function urlBase64ToUint8Array(value) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

// Asks for permission, registers the service worker and subscribes this
// browser. Call it straight from a click: browsers only show the permission
// prompt in response to a user gesture. Resolves to { endpoint, keys } for the
// backend; throws PushPermissionError if the user declines.
export async function subscribeDevice(publicKey) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new PushPermissionError();

  await navigator.serviceWorker.register("/sw.js");
  const registration = await navigator.serviceWorker.ready;

  // A subscription made with a different server key (after a key rotation)
  // can't be reused; drop it and make a fresh one.
  const existing = await registration.pushManager.getSubscription();
  if (existing) await existing.unsubscribe();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const { endpoint, keys } = subscription.toJSON();
  return { endpoint, keys };
}
