// Pure helpers for the automatic-pickup camera and reminder. Kept free of React
// and of aliased imports so they can be unit tested with `node --test`.

// Automatic pickup is driven by the EXIT camera, which only streams while its
// page does. So when the pickup window is open and a session is running, a page
// set to the exit camera turns it on by itself — once per page visit, so a
// teacher who turns it off isn't fought. A page set to the entry camera is left
// alone: arrivals are not part of pickup.
export function shouldAutoStartCamera({ isActive, pickupActive, cameraStatus, alreadyTried, cameraRole }) {
  return cameraRole === "exit" && isActive && pickupActive && cameraStatus === "off" && !alreadyTried;
}

// Everywhere except the live page the camera is off, so tracking can't see
// anyone: remind the teacher where to go.
export function shouldShowPickupBanner({ isActive, pickupActive, pathname }) {
  return isActive && pickupActive && pathname !== "/attendance/live";
}
