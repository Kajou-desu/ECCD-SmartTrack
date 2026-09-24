// Display helpers for the student-works page. Pure functions, so they're
// unit-tested in tests/submissions.test.js.

import { getFileExtension } from "./fileValidation.js";

// The little badge on each row. Students may upload PDF, PNG or JPEG, so the
// label comes from the file itself rather than always saying "PDF".
export function getFileBadge(fileName) {
  const extension = getFileExtension(fileName).slice(1).toUpperCase();

  if (extension === "PDF") return { label: "PDF", isPdf: true };
  return { label: extension.slice(0, 4) || "FILE", isPdf: false };
}

// "Sep 24, 2026, 8:15 AM" — includes the date because one material can gather
// work over several days. Returns "" for a missing/invalid value.
export function formatSubmittedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
