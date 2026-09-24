export function normalizeAttendanceTime(value) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized.includes("morning") || /\bam\b/.test(normalized)) return "am";
  if (normalized.includes("afternoon") || /\bpm\b/.test(normalized)) return "pm";

  return normalized;
}