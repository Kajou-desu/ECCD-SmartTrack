import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStudentCode, formatStudentCode } from "../src/features/students/utils/studentCode.js";

test("accepts ECCD-2026-<number> and returns the number", () => {
  assert.equal(parseStudentCode("ECCD-2026-1"), 1);
  assert.equal(parseStudentCode("ECCD-2026-12"), 12);
  assert.equal(parseStudentCode("ECCD-2026-999999999"), 999999999);
});

test("rejects a bare numeric id (the old URL form)", () => {
  assert.equal(parseStudentCode("12"), null);
});

const REJECTED = [
  ["wrong year", "ECCD-2025-12"],
  ["wrong prefix", "ABCD-2026-12"],
  ["lowercase", "eccd-2026-12"],
  ["missing number", "ECCD-2026-"],
  ["zero", "ECCD-2026-0"],
  ["leading zero", "ECCD-2026-012"],
  ["negative", "ECCD-2026--5"],
  ["decimal", "ECCD-2026-1.5"],
  ["exponent", "ECCD-2026-1e3"],
  ["hex", "ECCD-2026-0x10"],
  ["letters in number", "ECCD-2026-12a"],
  ["temp code", "ECCD-2026-TEMP-4b1c6f0e-0000-4000-8000-000000000000"],
  ["trailing space", "ECCD-2026-12 "],
  ["leading space", " ECCD-2026-12"],
  ["trailing newline", "ECCD-2026-12\n"],
  ["path traversal", "ECCD-2026-12/../13"],
  ["query smuggling", "ECCD-2026-12?x=1"],
  ["too many digits (beyond 32-bit)", "ECCD-2026-9999999999"],
  ["empty", ""],
];
for (const [label, value] of REJECTED) {
  test(`rejects ${label}: ${JSON.stringify(value)}`, () => {
    assert.equal(parseStudentCode(value), null);
  });
}

test("rejects non-strings without throwing", () => {
  for (const value of [undefined, null, 12, {}, [], ["ECCD-2026-12"]]) {
    assert.equal(parseStudentCode(value), null);
  }
});

test("round-trips with formatStudentCode, so links built from ids always parse", () => {
  for (const id of [1, 7, 42, 1000, 123456]) {
    assert.equal(parseStudentCode(formatStudentCode({ id })), id);
  }
});
