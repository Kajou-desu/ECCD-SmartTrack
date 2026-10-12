import { test } from "node:test";
import assert from "node:assert/strict";
import {
  secondsLeft,
  visibleChecks,
  shouldAutoStartCamera,
  shouldShowPickupBanner,
} from "../src/features/smartAttendance/utils/pickupChecks.js";
import {
  normalizePickupChecks,
  normalizePickupWindow,
  normalizeSessionResponse,
} from "../src/features/smartAttendance/utils/attendanceSession.js";

const check = (over = {}) => ({ id: 1, studentId: 5, name: "Ana Cruz", expiresInMs: 15000, ...over });

test("counts the time left from when the prompt arrived, not from a clock", () => {
  assert.equal(secondsLeft(check(), 1000, 1000), 15);
  assert.equal(secondsLeft(check(), 1000, 1001), 15); // 1 ms in: still "15" (rounded up)
  assert.equal(secondsLeft(check(), 1000, 6000), 10);
  assert.equal(secondsLeft(check(), 1000, 16000), 0);
  assert.equal(secondsLeft(check(), 1000, 99999), 0); // never negative
});

test("hides prompts that timed out or were already answered on this device", () => {
  const checks = [check({ id: 1 }), check({ id: 2, expiresInMs: 2000 }), check({ id: 3 })];
  assert.deepEqual(
    visibleChecks(checks, 0, 5000, new Set([3])).map((c) => c.id),
    [1],
  );
});

test("auto-starts the camera only when tracking is on, the session runs and it is still off", () => {
  const base = { isActive: true, pickupActive: true, cameraStatus: "off", alreadyTried: false };
  assert.equal(shouldAutoStartCamera(base), true);
  assert.equal(shouldAutoStartCamera({ ...base, isActive: false }), false);
  assert.equal(shouldAutoStartCamera({ ...base, pickupActive: false }), false);
  assert.equal(shouldAutoStartCamera({ ...base, cameraStatus: "live" }), false);
  assert.equal(shouldAutoStartCamera({ ...base, cameraStatus: "starting" }), false);
  assert.equal(shouldAutoStartCamera({ ...base, alreadyTried: true }), false); // teacher turned it off
});

test("reminds the teacher to open the live page from every other page", () => {
  const base = { isActive: true, pickupActive: true, pathname: "/dashboard" };
  assert.equal(shouldShowPickupBanner(base), true);
  assert.equal(shouldShowPickupBanner({ ...base, pathname: "/attendance/live" }), false);
  assert.equal(shouldShowPickupBanner({ ...base, pickupActive: false }), false);
  assert.equal(shouldShowPickupBanner({ ...base, isActive: false }), false);
});

test("normalizes prompts and the window, dropping anything malformed", () => {
  assert.deepEqual(normalizePickupChecks([check(), { id: "x" }, null, { id: 2, name: "B", expiresInMs: "soon" }]), [check()]);
  assert.deepEqual(normalizePickupChecks(undefined), []);
  assert.deepEqual(normalizePickupWindow({ active: true, endsAt: "2026-10-12T04:30:00.000Z" }), { active: true, endsAt: "2026-10-12T04:30:00.000Z" });
  assert.deepEqual(normalizePickupWindow(null), { active: false, endsAt: null });
  assert.deepEqual(normalizePickupWindow({ active: "yes" }), { active: false, endsAt: null });
});

test("a session response carries its prompts and window", () => {
  const out = normalizeSessionResponse({
    session: { id: 1 },
    pickupChecks: [check()],
    pickupWindow: { active: true, endsAt: null },
  });
  assert.equal(out.id, 1);
  assert.deepEqual(out.pickupChecks, [check()]);
  assert.equal(out.pickupWindow.active, true);
});
