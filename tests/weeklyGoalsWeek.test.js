import { test } from "node:test";
import assert from "node:assert/strict";
import { mondayOf, addDays, toWeekKey } from "../src/features/weeklyGoals/utils/week.js";

test("mondayOf returns the same Monday for any day in that week", () => {
  const monday = mondayOf(new Date(2026, 8, 21)); // Mon Sep 21 2026
  const friday = mondayOf(new Date(2026, 8, 25)); // Fri Sep 25 2026
  assert.equal(toWeekKey(monday), "2026-09-21");
  assert.equal(toWeekKey(friday), "2026-09-21");
});

test("mondayOf rolls a Sunday back to the previous Monday, not forward", () => {
  const sunday = mondayOf(new Date(2026, 8, 27)); // Sun Sep 27 2026
  assert.equal(toWeekKey(sunday), "2026-09-21");
});

test("addDays shifts by a week without mutating the input", () => {
  const monday = mondayOf(new Date(2026, 8, 21));
  const nextMonday = addDays(monday, 7);
  assert.equal(toWeekKey(monday), "2026-09-21");
  assert.equal(toWeekKey(nextMonday), "2026-09-28");
});
