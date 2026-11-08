import { test } from "node:test";
import assert from "node:assert/strict";
import {
  describeTransfer, normalizeTransfers, teacherOption, transferOutcome, transferPayload, transferProblem,
} from "../src/features/transfers/utils/transfers.js";

const student = { id: 5, name: "Ana Cruz", teacherId: 10, session: "morning", teacher: "Ann" };
const teachers = [
  { id: 11, name: "Cora", centerId: 1, centerName: "North" },
  { id: 20, name: "Dina", centerId: 2, centerName: "South" },
];

test("the payload carries only what changes", () => {
  assert.deepEqual(transferPayload({ student, session: "afternoon" }), { studentId: 5, toSession: "afternoon" });
  assert.deepEqual(transferPayload({ student, session: "morning", teacherId: "20" }), { studentId: 5, toTeacherId: 20 });
  assert.deepEqual(transferPayload({ student, session: "afternoon", teacherId: 11 }), { studentId: 5, toSession: "afternoon", toTeacherId: 11 });
  assert.deepEqual(transferPayload({ student, session: "morning", teacherId: 10 }), { studentId: 5 }); // same teacher: nothing
  assert.deepEqual(transferPayload({ student, session: "morning", teacherId: "" }), { studentId: 5 });
});

test("a transfer needs a real change and a valid session", () => {
  assert.equal(transferProblem({ student, session: "afternoon" }), "");
  assert.equal(transferProblem({ student, session: "morning", teacherId: 20 }), "");
  assert.match(transferProblem({ student, session: "morning" }), /different session or teacher/);
  assert.match(transferProblem({ student, session: "morning", teacherId: 10 }), /different session or teacher/);
  assert.match(transferProblem({ student, session: "evening" }), /Choose a session/);
  assert.match(transferProblem({ student, session: "" }), /Choose a session/);
});

test("outcome: session-only and same-center moves apply at once", () => {
  assert.equal(transferOutcome({ student, teachers, studentCenterId: 1 }).kind, "now");
  const sameCenter = transferOutcome({ student, teacherId: 11, teachers, studentCenterId: 1 });
  assert.equal(sameCenter.kind, "now");
  assert.match(sameCenter.text, /Cora is told/);
});

test("outcome: another center needs the other teacher to accept, and says the student stays meanwhile", () => {
  const out = transferOutcome({ student, teacherId: "20", teachers, studentCenterId: 1 });
  assert.equal(out.kind, "approval");
  assert.match(out.text, /Dina \(South\) has to accept first/);
  assert.match(out.text, /Ana Cruz stays with you/);
});

test("outcome: an Admin's move is always at once, and an unknown center is never treated as the same", () => {
  assert.equal(transferOutcome({ student, teacherId: 20, teachers, studentCenterId: 1, isAdmin: true }).kind, "now");
  assert.equal(transferOutcome({ student, teacherId: 11, teachers, studentCenterId: null }).kind, "approval");
});

test("labels", () => {
  assert.equal(teacherOption(teachers[1]), "Dina — South");
  assert.equal(teacherOption({ id: 1, name: "X", centerName: null }), "X — No center");
  const t = { id: 7, student: { name: "Ana Cruz" }, fromTeacher: { id: 10 }, toTeacher: { id: 20, name: "Dina", centerName: "South" }, fromSession: "morning", toSession: "afternoon" };
  assert.equal(describeTransfer(t), "Ana Cruz: to Dina (South), Afternoon session");
  assert.equal(describeTransfer({ ...t, toTeacher: { id: 10, name: "Ann" } }), "Ana Cruz: Afternoon session");
});

test("the list keeps only well-formed rows and survives garbage", () => {
  const ok = { id: 1, student: { name: "A" } };
  assert.deepEqual(normalizeTransfers({ incoming: [ok, null, { id: "x", student: {} }, { id: 2 }], outgoing: [ok] }), { incoming: [ok], outgoing: [ok] });
  assert.deepEqual(normalizeTransfers(undefined), { incoming: [], outgoing: [] });
  assert.deepEqual(normalizeTransfers({ incoming: "nope" }), { incoming: [], outgoing: [] });
});
