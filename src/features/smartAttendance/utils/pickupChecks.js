// Pure helpers for the automatic-pickup prompts and camera. Kept free of React
// and of aliased imports so they can be unit tested with `node --test`.

export const PICKUP_TICK_MS = 500;

// Whole seconds left on a prompt. The server sends the time remaining when it
// answered (not a timestamp), so a wrong clock on this device can't hide or
// stretch a prompt; it is counted down from when the answer arrived.
export function secondsLeft(check, receivedAt, now) {
  const remainingMs = check.expiresInMs - (now - receivedAt);
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

// Prompts still worth showing: not timed out and not already answered here.
export function visibleChecks(checks, receivedAt, now, answeredIds) {
  return checks.filter((c) => !answeredIds.has(c.id) && secondsLeft(c, receivedAt, now) > 0);
}

// Pickup tracking only works while the camera is streaming, and a browser only
// lets one page do that. So when the pickup window is open and a session is
// running, the live page turns the camera on by itself — once per page visit,
// so a teacher who turns it off isn't fought.
export function shouldAutoStartCamera({ isActive, pickupActive, cameraStatus, alreadyTried }) {
  return isActive && pickupActive && cameraStatus === "off" && !alreadyTried;
}

// Everywhere except the live page the camera is off, so tracking can't see
// anyone: remind the teacher where to go.
export function shouldShowPickupBanner({ isActive, pickupActive, pathname }) {
  return isActive && pickupActive && pathname !== "/attendance/live";
}
