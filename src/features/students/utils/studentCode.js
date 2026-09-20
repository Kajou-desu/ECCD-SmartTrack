// The backend assigns every student a studentCode ("ECCD-2026-<id>") at
// creation time (see finalStudentCode in students.controller.js), so this
// should always be present. The id-based fallback only covers a response
// that, for whatever reason, didn't include it — it reconstructs the same
// format rather than falling back to a bare number, so the ECCD-2026-*
// format is what's shown everywhere, with no exceptions.
export function formatStudentCode(student) {
  if (!student) return "N/A";
  if (student.studentCode) return student.studentCode;
  if (student.id != null) return `ECCD-2026-${student.id}`;
  return "N/A";
}
