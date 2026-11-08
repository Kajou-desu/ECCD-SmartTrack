import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESENCE_LABELS, normalizePresentStudents, presenceCounts } from "../src/features/smartAttendance/utils/presentStudents.js";

const row = (over = {}) => ({ studentId: 1, name: "Ana", status: "inside", arrivedAt: null, pickedUpAt: null, ...over });

test("labels are the three statuses the table shows", () => {
  assert.deepEqual(PRESENCE_LABELS, { inside: "Inside", not_detected: "Not Detected", picked_up: "Picked Up" });
});

test("keeps well-formed rows in the server's order and drops malformed ones", () => {
  const rows = [row({ studentId: 2 }), { studentId: "x", name: "B", status: "inside" }, null, row({ studentId: 3, status: "bogus" }), row({ studentId: 4, status: "not_detected" })];
  assert.deepEqual(normalizePresentStudents(rows).map((r) => r.studentId), [2, 4]);
  assert.deepEqual(normalizePresentStudents(undefined), []);
  assert.deepEqual(normalizePresentStudents("nope"), []);
});

test("counts each status", () => {
  const rows = [row(), row({ studentId: 2, status: "not_detected" }), row({ studentId: 3, status: "not_detected" }), row({ studentId: 4, status: "picked_up" })];
  assert.deepEqual(presenceCounts(rows), { inside: 1, not_detected: 2, picked_up: 1 });
  assert.deepEqual(presenceCounts([]), { inside: 0, not_detected: 0, picked_up: 0 });
});
