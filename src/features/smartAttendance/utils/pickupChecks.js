// Pure helpers for the automatic-pickup camera and reminder. Kept free of React
// and of aliased imports so they can be unit tested with `node --test`.

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
