import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeStudent } from "../src/utils/normalizeStudent.js";

test("keeps gender and uses the dedicated guardian contact when present", () => {
  const student = normalizeStudent({
    gender: "Female",
    guardianName: "Guardian Name",
    guardianPhone: "111-2222",
    motherName: "Mother Name",
    motherPhone: "333-4444",
  });

  assert.equal(student.gender, "Female");
  assert.equal(student.guardianName, "Guardian Name");
  assert.equal(student.guardianPhone, "111-2222");
});

test("uses a matching parent contact when no dedicated guardian is provided", () => {
  const student = normalizeStudent({
    motherName: "Mother Name",
    motherPhone: "333-4444",
    fatherName: "Father Name",
    fatherPhone: "555-6666",
  });

  assert.equal(student.guardianName, "Mother Name");
  assert.equal(student.guardianPhone, "333-4444");
});