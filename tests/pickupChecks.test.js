import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shouldAutoStartCamera,
  shouldShowPickupBanner,
} from "../src/features/smartAttendance/utils/pickupChecks.js";
import {
  normalizePickupWindow,
  normalizeSessionResponse,
} from "../src/features/smartAttendance/utils/attendanceSession.js";

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

test("normalizes the window, dropping anything malformed", () => {
  assert.deepEqual(normalizePickupWindow({ active: true, endsAt: "2026-10-12T04:30:00.000Z" }), { active: true, endsAt: "2026-10-12T04:30:00.000Z", mode: "auto" });
  assert.deepEqual(normalizePickupWindow(null), { active: false, endsAt: null, mode: "auto" });
  assert.deepEqual(normalizePickupWindow({ active: "yes" }), { active: false, endsAt: null, mode: "auto" });
});

test("a session response carries its window and no prompts", () => {
  const out = normalizeSessionResponse({
    session: { id: 1 },
    pickupChecks: [{ id: 1, name: "Ana", expiresInMs: 1000 }],
    pickupWindow: { active: true, endsAt: null },
  });
  assert.equal(out.id, 1);
  assert.equal("pickupChecks" in out, false);
  assert.equal(out.pickupWindow.active, true);
});
