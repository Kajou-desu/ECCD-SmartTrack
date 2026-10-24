import test from "node:test";
import assert from "node:assert/strict";
import {
  toCenterId,
  validateNewAccount,
  getTeacherMove,
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

test("a Teacher payload sends the center as a number (and no centerLocation)", () => {
  assert.equal(createAccountPayload(form({ role: "Teacher" })).centerId, 3);
  assert.equal("centerLocation" in createAccountPayload(form({ role: "Teacher" })), false);
  assert.equal(updateAccountPayload({ ...form({ role: "Teacher" }), accountId: 5 }).centerId, 3);
  assert.equal(createAccountPayload(form({ role: "Teacher", centerId: "" })).centerId, undefined);
});

test("a Parent or Guardian payload never carries a center (it follows their students)", () => {
  for (const role of ["Parent", "Guardian"]) {
    assert.equal(createAccountPayload(form({ role })).centerId, undefined, role);
    assert.equal(updateAccountPayload({ ...form({ role }), accountId: 5 }).centerId, undefined, role);
  }
});

test("the teacher-move choice is sent only for a Teacher, and only once made", () => {
  const edit = (patch) => updateAccountPayload({ ...form({ role: "Teacher" }), accountId: 5, ...patch });
  assert.equal("studentAction" in edit({}), false);
  assert.deepEqual(
    { a: edit({ studentAction: "move" }).studentAction, t: edit({ studentAction: "move" }).newTeacherId },
    { a: "move", t: undefined },
  );
  const transfer = edit({ studentAction: "transfer", newTeacherId: "8" });
  assert.equal(transfer.studentAction, "transfer");
  assert.equal(transfer.newTeacherId, 8);
  assert.equal("studentAction" in updateAccountPayload({ ...form(), accountId: 5, studentAction: "move" }), false);
  assert.equal("studentAction" in createAccountPayload(form({ role: "Teacher", studentAction: "move" })), false);
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

test("an Admin must choose a center for a new Teacher, and only for a Teacher", () => {
  assert.equal(validateNewAccount(form({ role: "Teacher", centerId: "" }), "Admin"), "Choose the center for this account.");
  assert.equal(validateNewAccount(form({ centerId: "" }), "Admin"), "");
  assert.equal(validateNewAccount(form({ role: "Guardian", centerId: "" }), "Admin"), "");
});

test("a Teacher is not asked for a center (the server uses their own)", () => {
  assert.equal(validateNewAccount(form({ centerId: "" }), "Teacher"), "");
});

const teacher = { id: 5, role: "Teacher", centerId: 1 };
const accounts = [
  teacher,
  { id: 6, role: "Teacher", centerId: 1, isActive: true, name: "Same center" },
  { id: 7, role: "Teacher", centerId: 2, isActive: true, name: "Other center" },
  { id: 8, role: "Teacher", centerId: 1, isActive: false, name: "Inactive" },
  { id: 9, role: "Parent", centerId: 1, name: "Parent" },
];
const students = [{ id: 1, teacherId: 5 }, { id: 2, teacherId: 5 }, { id: 3, teacherId: 6 }];
const moved = (patch = {}) => ({ ...form({ role: "Teacher", centerId: "2" }), ...patch });

test("moving a Teacher with enrolled students needs a decision, offering only active teachers of the current center", () => {
  const move = getTeacherMove(moved(), teacher, students, accounts);
  assert.equal(move.enrolled, 2);
  assert.equal(move.oldCenterId, 1);
  assert.equal(move.newCenterId, 2);
  assert.deepEqual(move.candidates.map((c) => c.id), [6]);
});

test("moving a Teacher needs no decision without students, without a center change, or for other roles", () => {
  assert.equal(getTeacherMove(moved(), teacher, [{ id: 3, teacherId: 6 }], accounts), null);
  assert.equal(getTeacherMove(moved({ centerId: "1" }), teacher, students, accounts), null);
  assert.equal(getTeacherMove(moved({ centerId: "" }), teacher, students, accounts), null);
  assert.equal(getTeacherMove(moved({ role: "Parent" }), teacher, students, accounts), null);
  assert.equal(getTeacherMove(moved(), { ...teacher, role: "Parent" }, students, accounts), null);
  assert.equal(getTeacherMove(moved(), null, students, accounts), null);
});

test("with no other teacher at the current center there is nobody to transfer to", () => {
  const alone = accounts.filter((a) => a.id !== 6);
  assert.deepEqual(getTeacherMove(moved(), teacher, students, alone).candidates, []);
  assert.deepEqual(getTeacherMove(moved(), { ...teacher, centerId: null }, students, accounts).candidates, []);
});
