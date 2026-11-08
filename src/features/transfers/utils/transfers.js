// Pure helpers for moving a student to another session, teacher or center.
// No React and no aliased imports, so they can be unit tested with `node --test`.

export const SESSION_LABELS = { morning: "Morning", afternoon: "Afternoon" };

// What would change, as the API payload: only the fields that differ from where
// the student is now, so the server never sees a no-op field.
// "no teacher chosen" (undefined, null or the empty select value) means keep the current one.
const chosenTeacher = (teacherId) => (teacherId === undefined || teacherId === null || teacherId === "" ? null : Number(teacherId));

export function transferPayload({ student, teacherId, session }) {
  const payload = { studentId: student.id };
  const chosen = chosenTeacher(teacherId);
  if (chosen !== null && chosen !== student.teacherId) payload.toTeacherId = chosen;
  if (session && session !== student.session) payload.toSession = session;
  return payload;
}

// "" when the choice is fine, otherwise what to tell the person.
export function transferProblem({ student, teacherId, session }) {
  if (!SESSION_LABELS[session]) return "Choose a session.";
  const { toTeacherId, toSession } = transferPayload({ student, teacherId, session });
  if (toTeacherId === undefined && toSession === undefined) return "Choose a different session or teacher.";
  return "";
}

// What will happen once it is sent, so the person isn't surprised that a move to
// another center doesn't take effect at once. `teachers` is the list from the
// API; `studentCenterId` is the student's current center.
export function transferOutcome({ student, teacherId, teachers, studentCenterId, isAdmin }) {
  const chosen = chosenTeacher(teacherId);
  const target = chosen === null || chosen === student.teacherId ? null : teachers.find((t) => t.id === chosen);
  if (!target) return { kind: "now", text: "This takes effect right away." };
  if (isAdmin || (studentCenterId != null && target.centerId === studentCenterId)) {
    return { kind: "now", text: `This takes effect right away. ${target.name} is told.` };
  }
  return {
    kind: "approval",
    text: `${target.name} (${target.centerName}) has to accept first. ${student.name} stays with you until they do, and you can cancel the request.`,
  };
}

export const teacherOption = (t) => `${t.name} — ${t.centerName ?? "No center"}`;

// One line for a pending request in the list.
export function describeTransfer(t) {
  const parts = [];
  if (t.fromTeacher?.id !== t.toTeacher?.id) parts.push(`to ${t.toTeacher?.name ?? "?"}${t.toTeacher?.centerName ? ` (${t.toTeacher.centerName})` : ""}`);
  if (t.fromSession !== t.toSession) parts.push(`${SESSION_LABELS[t.toSession] ?? t.toSession} session`);
  return `${t.student?.name ?? "A student"}: ${parts.join(", ")}`;
}

// The server returns { incoming, outgoing }; anything else is treated as empty.
export function normalizeTransfers(data) {
  const clean = (list) => (Array.isArray(list) ? list.filter((t) => t && Number.isInteger(t.id) && t.student) : []);
  return { incoming: clean(data?.incoming), outgoing: clean(data?.outgoing) };
}
