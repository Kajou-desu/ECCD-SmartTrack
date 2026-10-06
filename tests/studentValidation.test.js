import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { studentSchema } from "../src/validation/student.js";

const valid = {
  firstName: "Ari",
  lastName: "Bell",
  birthday: "2021-05-01",
  gender: "female",
  address: "12 Rizal St, Angeles City",
  motherName: "Mia Bell",
};

const issues = (input) => {
  const result = studentSchema.safeParse({ ...valid, ...input });
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
};

describe("studentSchema mirrors backend limits", () => {
  it("accepts a valid student", () => assert.deepEqual(issues({}), []));
  it("rejects over-long names and notes", () => {
    assert.ok(issues({ firstName: "a".repeat(101) }).length);
    assert.ok(issues({ specialNotes: "a".repeat(2001) }).length);
    assert.ok(issues({ address: "a".repeat(501) }).length);
  });
  it("rejects future and implausibly old birthdays", () => {
    assert.ok(issues({ birthday: "2999-01-01" }).length);
    assert.ok(issues({ birthday: "1850-01-01" }).length);
  });
  it("validates mother/father/guardian phones the way the backend does", () => {
    assert.ok(issues({ motherPhone: "abc" }).length);
    assert.ok(issues({ fatherPhone: "123" }).length);
    assert.deepEqual(issues({ motherPhone: "0917 123 4567", fatherPhone: "" }), []);
  });
  it("validates optional emails but allows them blank", () => {
    assert.ok(issues({ motherEmail: "not-an-email" }).length);
    assert.deepEqual(issues({ motherEmail: "", fatherEmail: "dad@example.com" }), []);
  });
});
