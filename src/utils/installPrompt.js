// When to offer "add to home screen". Kept free of React so it can be unit
// tested. The offer is per device (localStorage), like the appearance settings.

export const INSTALL_DISMISSED_KEY = "eccd.installPromptDismissedAt";

// After "Not now" the offer stays away this long.
export const INSTALL_REOFFER_DAYS = 30;

// Already running as an installed app: nothing to offer.
export function isStandalone(win = globalThis.window) {
  if (!win) return false;
  return Boolean(win.matchMedia?.("(display-mode: standalone)")?.matches || win.navigator?.standalone === true);
}

// Safari on iPhone/iPad has no install event; the only way is the Share menu,
// so the popup shows those steps instead. Other iOS browsers (Chrome, Firefox)
// can't add to the home screen here, so they get no popup. iPadOS 13+ reports
// itself as a Mac, hence the touch-points check.
export function isIosSafari(nav = globalThis.navigator) {
  if (!nav) return false;
  const ua = nav.userAgent || "";
  const isIos = /iPhone|iPad|iPod/.test(ua) || (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Android/.test(ua);
  return isIos && isSafari;
}

export function wasDismissedRecently(now = Date.now(), storage = globalThis.localStorage) {
  try {
    const at = Number(storage?.getItem(INSTALL_DISMISSED_KEY));
    return Number.isFinite(at) && at > 0 && now - at < INSTALL_REOFFER_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false; // storage blocked: offering again is harmless
  }
}

export function rememberDismissed(now = Date.now(), storage = globalThis.localStorage) {
  try {
    storage?.setItem(INSTALL_DISMISSED_KEY, String(now));
  } catch {
    // Not persisted; the popup just won't remember this choice next visit.
  }
}
