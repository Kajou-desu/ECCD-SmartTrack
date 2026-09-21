// Pure helpers for the live attendance monitor and camera loop. No React and no
// aliased imports, so they can be unit tested with `node --test`.

export const FRAME_INTERVAL_MS = 700; // ~1.4 frames/s: plenty for a door, and under the server's rate limit
export const FRAME_MAX_WIDTH = 640; // a 640px JPEG is ~50 KB; the server rejects frames over 200 KB
export const FRAME_JPEG_QUALITY = 0.7;
export const MONITOR_POLL_MS = 2000;
export const MAX_BACKOFF_MS = 10000;
export const DEGRADED_AFTER_FAILURES = 3;

// Delay before the next frame: hold a steady cadence, but never queue up
// (the loop only sends the next frame after the previous response arrives).
export function nextFrameDelay(elapsedMs, intervalMs = FRAME_INTERVAL_MS) {
  return Math.max(0, intervalMs - elapsedMs);
}

// Size of the frame to capture: the video's own size, capped to maxWidth,
// aspect ratio preserved. { width: 0, height: 0 } means "no video yet".
export function frameSize(videoWidth, videoHeight, maxWidth = FRAME_MAX_WIDTH) {
  if (!videoWidth || !videoHeight) return { width: 0, height: 0 };
  const width = Math.min(videoWidth, maxWidth);
  return { width, height: Math.round((videoHeight * width) / videoWidth) };
}

// What the loop does after a failed frame. `consecutiveFailures` counts this
// failure (1 on the first).
//   409 -> the session ended: stop.   401/403 -> not allowed: stop.
//   429 -> rate limited: wait it out.  anything else (502/503, network, timeout)
//   -> back off 1s, 2s, 4s, 8s, then 10s, and keep trying.
export function classifyFrameError(error, consecutiveFailures) {
  const status = error?.status;
  if (status === 409) return { action: "stop", reason: "session-ended" };
  if (status === 401 || status === 403) return { action: "stop", reason: "not-allowed" };
  if (status === 429) return { action: "retry", delayMs: 5000 };
  const exponent = Math.max(0, Math.min(consecutiveFailures - 1, 4));
  return { action: "retry", delayMs: Math.min(MAX_BACKOFF_MS, 1000 * 2 ** exponent) };
}

const clampPercent = (value) => Math.min(100, Math.max(0, value));

// A face box [top, right, bottom, left] in frame pixels -> percentage CSS, so
// it stays aligned with the video however large the video is drawn.
export function boxToStyle(box, frameWidth, frameHeight) {
  if (!Array.isArray(box) || box.length !== 4 || !frameWidth || !frameHeight) return null;
  const [top, right, bottom, left] = box;
  const pct = (value, total) => `${clampPercent((value / total) * 100).toFixed(2)}%`;
  return {
    top: pct(top, frameHeight),
    left: pct(left, frameWidth),
    width: pct(right - left, frameWidth),
    height: pct(bottom - top, frameHeight),
  };
}

// verified: already marked present. waiting: recognised, but the tag hasn't been
// seen yet. unknown: a face we can't (or won't) put a name to.
export function faceTone(face) {
  if (face?.verified) return "verified";
  return face?.student ? "waiting" : "unknown";
}

const STATUS_LABELS = {
  verified: "Marked present",
  face_only: "Face seen, waiting for tag",
  ble_only: "Tag seen, waiting for face",
};
export function statusLabel(status) {
  return STATUS_LABELS[status] ?? "Unknown";
}

// Plain-language reasons the camera can fail, with what to do about it.
export function describeCameraError(error) {
  switch (error?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access is blocked. Allow the camera for this site in your browser settings, then try again.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera was found on this device. Connect one, or open this page on a device with a camera.";
    case "NotReadableError":
    case "AbortError":
      return "The camera is being used by another app. Close it, then try again.";
    case "UnsupportedError":
      return "This browser can't use the camera on this page. Open the site over HTTPS in an up-to-date browser.";
    default:
      return "The camera couldn't be started. Reload the page and try again.";
  }
}

// Why the loop stopped by itself, for the message shown to the teacher.
export function describeStopReason(reason) {
  if (reason === "session-ended") return "Attendance was stopped, so the camera was turned off.";
  if (reason === "not-allowed") return "You no longer have permission to run attendance. Sign in again.";
  return "The camera was turned off.";
}

const ARRIVAL_TIME = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
export function formatArrivalTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : ARRIVAL_TIME.format(date);
}
