import { test } from "node:test";
import assert from "node:assert/strict";
import { canMarkPickedUp } from "../src/features/attendance/utils/attendancePickup.js";

const TODAY = "2026-09-28";
const present = { status: "present", arrivedAt: "2026-09-28T00:00:00Z", pickedUpAt: null };

test("offers pickup for a present student today who hasn't left", () => {
  assert.equal(canMarkPickedUp(present, TODAY, TODAY), true);
});

test("never offers it unless the student is present", () => {
  for (const status of ["absent", "excused", null, undefined]) {
    assert.equal(canMarkPickedUp({ ...present, status }, TODAY, TODAY), false);
  }
});

test("does not offer it again once picked up", () => {
  assert.equal(canMarkPickedUp({ ...present, pickedUpAt: "2026-09-28T07:00:00Z" }, TODAY, TODAY), false);
});

test("does not offer it when viewing another day (server only accepts today)", () => {
  assert.equal(canMarkPickedUp(present, "2026-09-27", TODAY), false);
});

test("handles a missing record", () => {
  assert.equal(canMarkPickedUp(undefined, TODAY, TODAY), false);
});
