// Date ranges and CSV rows for the attendance exports. Free of React and
// aliased imports so it can be unit-tested directly. All dates are
// "YYYY-MM-DD" strings handled with UTC arithmetic, so the browser's timezone
// can never shift a day. The dates written INTO a file are MM/DD/YYYY.
import { formatUsDate } from "../../../utils/usDate.js";

export const EXPORT_PERIODS = ["day", "week", "month"];

const pad = (n) => String(n).padStart(2, "0");
const key = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const parse = (dateKey) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

// day: the date itself. week: Monday to Sunday containing it (the same
// Monday-start week the weekly goals use). month: first to last day.
export function rangeForPeriod(dateKey, period) {
  const date = parse(dateKey);
  if (period === "week") {
    const sinceMonday = (date.getUTCDay() + 6) % 7;
    const monday = new Date(date);
    monday.setUTCDate(date.getUTCDate() - sinceMonday);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    return { from: key(monday), to: key(sunday) };
  }
  if (period === "month") {
    const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
    return { from: key(first), to: key(last) };
  }
  return { from: dateKey, to: dateKey };
}

export function rangeFilename(period, { from, to }) {
  return period === "day" ? `attendance_${from}.csv` : `attendance_${period}_${from}_to_${to}.csv`;
}

export const RANGE_HEADERS = ["Date", "Student Code", "Student Name", "Session", "Status", "Late", "Arrived", "Picked up"];

// The "Late" cell. Late is a subset of present (they arrived, just after their
// session's start time), so only a present student has an answer: Yes or No.
export const lateCell = (record) => (record.status === "present" ? (record.late ? "Yes" : "No") : "");
// The import template's columns. They are named as in the exports, so an export can be re-imported.
export const IMPORT_HEADERS = ["Student Name", "Date", "Status"];

const SESSION_LABELS = { morning: "Morning", afternoon: "Afternoon" };
const titleCase = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not recorded");

// `formatTime` is passed in so this stays testable without a locale.
export function rangeRows(records, formatTime) {
  return records.map((r) => [
    formatUsDate(r.date),
    r.studentCode,
    r.name,
    SESSION_LABELS[r.session] ?? "",
    titleCase(r.status),
    lateCell(r),
    r.status === "present" ? formatTime(r.arrivedAt) : "",
    r.status === "present" ? formatTime(r.pickedUpAt) : "",
  ]);
}
