// The four school-time fields as 24-hour "HH:MM" strings, the same shape the
// server sends and accepts. Free of React and aliased imports so it can be
// unit-tested directly. Mirrors the server's rules (utils/schoolTimes.js there),
// which stay the authority: this only saves a round trip for an obvious mistake.

export const SCHOOL_TIME_FIELDS = ["morningStart", "morningEnd", "afternoonStart", "afternoonEnd"];

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

// "" when the times are fine, otherwise a sentence saying what to fix. Zero-
// padded "HH:MM" strings sort in time order, so they compare as plain strings.
export function schoolTimesProblem(values) {
  if (SCHOOL_TIME_FIELDS.some((field) => !CLOCK.test(values?.[field] ?? ""))) {
    return "Enter all four times.";
  }
  if (values.morningStart >= values.morningEnd) return "The morning session must end after it starts.";
  if (values.afternoonStart >= values.afternoonEnd) return "The afternoon session must end after it starts.";
  if (values.morningEnd > values.afternoonStart) return "The afternoon session can't start before the morning session ends.";
  return "";
}

// "13:05" -> "1:05 PM", for sentences (the inputs show times in the browser's own style).
export function formatClock12(value) {
  const match = CLOCK.exec(value ?? "");
  if (!match) return "";
  const hours = Number(value.slice(0, 2));
  return `${hours % 12 || 12}:${value.slice(3)} ${hours < 12 ? "AM" : "PM"}`;
}

export function pickSchoolTimes(source) {
  return Object.fromEntries(SCHOOL_TIME_FIELDS.map((field) => [field, source?.[field] ?? ""]));
}
