import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeAttendanceTime } from "../src/features/attendance/utils/attendanceFilters.js";

test("normalizes attendance session labels for AM/PM filtering", () => {
  assert.equal(normalizeAttendanceTime("morning"), "am");
  assert.equal(normalizeAttendanceTime("Morning (AM)"), "am");
  assert.equal(normalizeAttendanceTime("afternoon"), "pm");
  assert.equal(normalizeAttendanceTime("PM"), "pm");
});