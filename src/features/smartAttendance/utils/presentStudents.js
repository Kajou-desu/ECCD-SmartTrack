// Pure helpers for the Present Students table. No React and no aliased imports,
// so they can be unit tested with `node --test`.

export const PRESENCE_LABELS = {
  inside: "Inside",
  not_detected: "Not Detected",
  picked_up: "Picked Up",
};

// The server sends the rows already ordered (Not Detected first); only the
// shape is checked here, so a malformed row can't break the page.
export function normalizePresentStudents(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row) =>
      row &&
      Number.isInteger(row.studentId) &&
      typeof row.name === "string" &&
      Object.hasOwn(PRESENCE_LABELS, row.status),
  );
}

export function presenceCounts(students) {
  const counts = { inside: 0, not_detected: 0, picked_up: 0 };
  for (const student of students) counts[student.status] += 1;
  return counts;
}
