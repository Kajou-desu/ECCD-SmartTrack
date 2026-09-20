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

// Student detail URLs use the student code, and only the student code:
// exactly "ECCD-2026-" followed by the incrementing number — a positive
// integer with no leading zeros, sign, spaces or other text. Anything else
// (a bare "12", "eccd-2026-12", "ECCD-2026-012", "ECCD-2026-12/../x") returns
// null. The digit cap keeps the result inside a 32-bit database integer.
const STUDENT_CODE_PATTERN = /^ECCD-2026-([1-9][0-9]{0,8})$/;

// "ECCD-2026-12" -> 12, or null if `value` isn't a valid student code.
// The number is the student's database id (see finalStudentCode in the
// backend's students.controller.js), which is what the API is queried by.
export function parseStudentCode(value) {
  if (typeof value !== "string") return null;
  const match = STUDENT_CODE_PATTERN.exec(value);
  return match ? Number(match[1]) : null;
}
