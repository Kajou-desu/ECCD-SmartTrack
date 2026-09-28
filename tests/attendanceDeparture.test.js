import { test } from "node:test";
import assert from "node:assert/strict";
import { canMarkDeparted } from "../src/features/attendance/utils/attendanceDeparture.js";

const TODAY = "2026-09-28";
const present = { status: "present", arrivedAt: "2026-09-28T00:00:00Z", departedAt: null };

test("offers departure for a present student today who hasn't left", () => {
  assert.equal(canMarkDeparted(present, TODAY, TODAY), true);
});

test("never offers it unless the student is present", () => {
  for (const status of ["absent", "excused", null, undefined]) {
    assert.equal(canMarkDeparted({ ...present, status }, TODAY, TODAY), false);
  }
});

test("does not offer it again once departed", () => {
  assert.equal(canMarkDeparted({ ...present, departedAt: "2026-09-28T07:00:00Z" }, TODAY, TODAY), false);
});

test("does not offer it when viewing another day (server only accepts today)", () => {
  assert.equal(canMarkDeparted(present, "2026-09-27", TODAY), false);
});

test("handles a missing record", () => {
  assert.equal(canMarkDeparted(undefined, TODAY, TODAY), false);
});
