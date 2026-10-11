import test from "node:test";
import assert from "node:assert/strict";
import {
  toCenterId,
  validateNewAccount,
  createAccountPayload,
  updateAccountPayload,
  INITIAL_FORM,
} from "../src/features/accounts/utils/accountUtils.js";

const form = (patch = {}) => ({ ...INITIAL_FORM, email: "A@b.co", role: "Parent", studentIds: [1], centerId: "3", ...patch });

test("toCenterId turns the select's string into an id, or nothing", () => {
  assert.equal(toCenterId("3"), 3);
  assert.equal(toCenterId(3), 3);
  for (const bad of ["", null, undefined, "abc", "0", "-2", "1.5"]) assert.equal(toCenterId(bad), undefined, String(bad));
});

test("payloads send the center as a number (and no centerLocation)", () => {
  assert.equal(createAccountPayload(form()).centerId, 3);
  assert.equal("centerLocation" in createAccountPayload(form()), false);
  assert.equal(updateAccountPayload({ ...form(), accountId: 5 }).centerId, 3);
  assert.equal(createAccountPayload(form({ centerId: "" })).centerId, undefined);
});

test("a new Parent or Guardian needs at least one student", () => {
  for (const role of ["Parent", "Guardian"]) {
    assert.match(validateNewAccount(form({ role, studentIds: [] }), "Teacher"), /at least one student/);
    assert.equal(validateNewAccount(form({ role }), "Teacher"), "");
  }
});

test("a Teacher or Admin account does not need a student", () => {
  assert.equal(validateNewAccount(form({ role: "Teacher", studentIds: [] }), "Admin"), "");
  assert.equal(validateNewAccount(form({ role: "Admin", studentIds: [], centerId: "" }), "Admin"), "");
});

test("an Admin must choose a center for every account except an Admin's", () => {
  assert.equal(validateNewAccount(form({ centerId: "" }), "Admin"), "Choose the center for this account.");
  assert.equal(validateNewAccount(form({ role: "Teacher", centerId: "" }), "Admin"), "Choose the center for this account.");
});

test("a Teacher is not asked for a center (the server uses their own)", () => {
  assert.equal(validateNewAccount(form({ centerId: "" }), "Teacher"), "");
});
