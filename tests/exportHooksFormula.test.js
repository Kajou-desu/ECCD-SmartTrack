import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Both exports used to define their own escape function that only doubled
// quotes, which let =HYPERLINK(...) style names run as formulas in Excel.
for (const file of [
  "src/features/students/hooks/useStudents.js",
  "src/features/attendance/hooks/useAttendance.js",
]) {
  test(`${file} uses the shared formula-safe CSV helper`, () => {
    const src = readFileSync(file, "utf8");
    assert.match(src, /from "@utils\/exportCsv\.js"/);
    assert.match(src, /downloadCsv\(/);
    assert.doesNotMatch(src, /replace\(\/"\/g, '""'\)/);
  });
}
