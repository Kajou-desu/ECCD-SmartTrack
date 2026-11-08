import { test } from "node:test";
import assert from "node:assert/strict";
import { schoolTimesProblem, formatClock12, pickSchoolTimes } from "../src/features/settings/utils/schoolTimes.js";

const ok = { morningStart: "08:00", morningEnd: "10:30", afternoonStart: "13:00", afternoonEnd: "14:30" };

test("accepts a normal day, and a morning that ends as the afternoon starts", () => {
  assert.equal(schoolTimesProblem(ok), "");
  assert.equal(schoolTimesProblem({ ...ok, morningEnd: "13:00" }), "");
});

test("asks for all four times", () => {
  for (const field of Object.keys(ok)) {
    assert.match(schoolTimesProblem({ ...ok, [field]: "" }), /all four/, field);
  }
  assert.match(schoolTimesProblem({ ...ok, morningStart: "8:00" }), /all four/);
  assert.match(schoolTimesProblem({ ...ok, morningStart: "24:00" }), /all four/);
  assert.match(schoolTimesProblem(undefined), /all four/);
});

test("each session must end after it starts, and they may not overlap", () => {
  assert.match(schoolTimesProblem({ ...ok, morningEnd: "08:00" }), /morning session must end after/);
  assert.match(schoolTimesProblem({ ...ok, afternoonEnd: "12:00" }), /afternoon session must end after/);
  assert.match(schoolTimesProblem({ ...ok, morningEnd: "13:30", afternoonEnd: "15:00" }), /can't start before the morning/);
});

test("formats clock times for sentences", () => {
  assert.equal(formatClock12("08:00"), "8:00 AM");
  assert.equal(formatClock12("13:05"), "1:05 PM");
  assert.equal(formatClock12("00:15"), "12:15 AM");
  assert.equal(formatClock12("12:00"), "12:00 PM");
  assert.equal(formatClock12("bad"), "");
  assert.equal(formatClock12(undefined), "");
});

test("picks only the four fields from a server response", () => {
  assert.deepEqual(pickSchoolTimes({ ...ok, centerId: 3, isDefault: true }), ok);
  assert.deepEqual(pickSchoolTimes(undefined), { morningStart: "", morningEnd: "", afternoonStart: "", afternoonEnd: "" });
});
