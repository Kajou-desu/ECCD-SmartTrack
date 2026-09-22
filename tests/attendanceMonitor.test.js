import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FRAME_INTERVAL_MS,
  MAX_BACKOFF_MS,
  nextFrameDelay,
  frameSize,
  classifyFrameError,
  boxToStyle,
  faceTone,
  statusLabel,
  describeCameraError,
  describeStopReason,
  formatArrivalTime,
} from "../src/features/smartAttendance/utils/attendanceMonitor.js";

test("nextFrameDelay keeps a steady cadence and never goes negative", () => {
  assert.equal(nextFrameDelay(0), FRAME_INTERVAL_MS);
  assert.equal(nextFrameDelay(300), FRAME_INTERVAL_MS - 300);
  assert.equal(nextFrameDelay(FRAME_INTERVAL_MS), 0);
  assert.equal(nextFrameDelay(5000), 0); // a slow response doesn't queue extra delay
});

test("frameSize caps the width and preserves the aspect ratio", () => {
  assert.deepEqual(frameSize(1280, 720), { width: 640, height: 360 });
  assert.deepEqual(frameSize(480, 640), { width: 480, height: 640 }); // already small: untouched
  assert.deepEqual(frameSize(1920, 1080, 640), { width: 640, height: 360 });
  assert.deepEqual(frameSize(0, 0), { width: 0, height: 0 });
  assert.deepEqual(frameSize(undefined, 480), { width: 0, height: 0 });
});

test("classifyFrameError stops on a finished session or lost permission", () => {
  assert.deepEqual(classifyFrameError({ status: 409 }, 1), { action: "stop", reason: "session-ended" });
  assert.deepEqual(classifyFrameError({ status: 401 }, 1), { action: "stop", reason: "not-allowed" });
  assert.deepEqual(classifyFrameError({ status: 403 }, 1), { action: "stop", reason: "not-allowed" });
});

test("classifyFrameError waits out a rate limit", () => {
  assert.deepEqual(classifyFrameError({ status: 429 }, 1), { action: "retry", delayMs: 5000 });
});

test("classifyFrameError backs off exponentially, capped, for everything else", () => {
  const delays = [1, 2, 3, 4, 5, 6, 50].map((n) => classifyFrameError({ status: 502 }, n).delayMs);
  assert.deepEqual(delays, [1000, 2000, 4000, 8000, MAX_BACKOFF_MS, MAX_BACKOFF_MS, MAX_BACKOFF_MS]);
  // network errors / timeouts have no status
  assert.deepEqual(classifyFrameError(new Error("network"), 1), { action: "retry", delayMs: 1000 });
  assert.deepEqual(classifyFrameError({ name: "AbortError" }, 2), { action: "retry", delayMs: 2000 });
  assert.equal(classifyFrameError(undefined, 0).delayMs, 1000);
});

test("boxToStyle converts frame pixels to percentages", () => {
  // [top, right, bottom, left] in a 640x480 frame
  assert.deepEqual(boxToStyle([48, 320, 240, 160], 640, 480), {
    top: "10.00%", left: "25.00%", width: "25.00%", height: "40.00%",
  });
});

test("boxToStyle clamps out-of-frame boxes and rejects unusable input", () => {
  const s = boxToStyle([-10, 700, 500, -20], 640, 480);
  assert.equal(s.top, "0.00%");
  assert.equal(s.left, "0.00%");
  assert.ok(parseFloat(s.width) <= 100 && parseFloat(s.height) <= 100);
  assert.equal(boxToStyle([1, 2, 3], 640, 480), null);
  assert.equal(boxToStyle(null, 640, 480), null);
  assert.equal(boxToStyle([1, 2, 3, 4], 0, 480), null);
});

test("faceTone distinguishes verified, waiting and unknown faces", () => {
  assert.equal(faceTone({ student: { id: 1, name: "Ana" }, verified: true }), "verified");
  assert.equal(faceTone({ student: { id: 1, name: "Ana" }, verified: false }), "waiting");
  assert.equal(faceTone({ student: null, verified: false }), "unknown");
  assert.equal(faceTone(undefined), "unknown");
});

test("statusLabel has plain-language text for every status the server sends", () => {
  assert.equal(statusLabel("verified"), "Marked present");
  assert.equal(statusLabel("face_only"), "Face seen, waiting for tag");
  assert.equal(statusLabel("ble_only"), "Tag seen, waiting for face");
  assert.equal(statusLabel("???"), "Unknown");
});

test("describeCameraError explains what to do for each failure", () => {
  assert.match(describeCameraError({ name: "NotAllowedError" }), /blocked.*settings/i);
  assert.match(describeCameraError({ name: "SecurityError" }), /blocked/i);
  assert.match(describeCameraError({ name: "NotFoundError" }), /no camera/i);
  assert.match(describeCameraError({ name: "NotReadableError" }), /another app/i);
  assert.match(describeCameraError({ name: "UnsupportedError" }), /HTTPS/);
  assert.match(describeCameraError(new Error("weird")), /couldn't be started/i);
  assert.match(describeCameraError(undefined), /couldn't be started/i);
});

test("describeStopReason", () => {
  assert.match(describeStopReason("session-ended"), /stopped/i);
  assert.match(describeStopReason("not-allowed"), /permission/i);
  assert.match(describeStopReason("other"), /turned off/i);
});

test("formatArrivalTime shows a local clock time and tolerates bad input", () => {
  assert.match(formatArrivalTime("2026-09-20T00:31:00.000Z"), /^\d{1,2}:\d{2}\s?(AM|PM)$/i);
  assert.equal(formatArrivalTime("not a date"), "");
  assert.equal(formatArrivalTime(undefined), "");
});
