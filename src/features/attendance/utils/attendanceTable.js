// Rows and columns for the week and month attendance tables. Free of React and
// aliased imports so it can be unit-tested directly. Dates are "YYYY-MM-DD"
// strings handled with UTC arithmetic, so the browser's timezone can never
// shift a day.

import { rangeForPeriod } from "./attendanceRange.js";
import { normalizeAttendanceTime } from "./attendanceFilters.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n) => String(n).padStart(2, "0");
const parse = (dateKey) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

// "present" with a late arrival is shown as its own state; a student with no
// record that day (or none yet) is "none", never silently "absent".
export function attendanceCellState(record) {
  if (!record?.status) return "none";
  if (record.status === "present" && record.late) return "late";
  return record.status;
}

// Every date from `from` to `to`, inclusive.
function datesBetween({ from, to }) {
  const dates = [];
  const end = parse(to);
  for (let day = parse(from); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    dates.push(`${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`);
  }
  return dates;
}

// period: "week" (Mon-Fri) or "month" (each school day). A Saturday or Sunday
// is only a column if attendance was actually recorded on it, so a make-up
// class is never hidden.
//   roster  - the day's student list (every enrolled student, recorded or not)
//   records - the recorded attendance for the whole period, from the range API
export function buildAttendanceTable({ period, selectedDate, roster = [], records = [] }) {
  const range = rangeForPeriod(selectedDate, period);
  const recordedDates = new Set(records.map((record) => record.date));

  const columns = datesBetween(range)
    .map((date) => {
      const parsed = parse(date);
      return { date, weekday: WEEKDAYS[parsed.getUTCDay()], day: parsed.getUTCDate(), weekend: [0, 6].includes(parsed.getUTCDay()) };
    })
    .filter((column) => !column.weekend || recordedDates.has(column.date));

  const byStudentAndDate = new Map(records.map((record) => [`${record.studentId}|${record.date}`, record]));

  // The roster first, so students with no record in the period still get a
  // row; then anyone who only appears in the records (e.g. since withdrawn).
  const students = new Map(roster.map((s) => [s.id, { studentId: s.id, name: s.name, session: s.session }]));
  for (const record of records) {
    if (!students.has(record.studentId)) {
      students.set(record.studentId, { studentId: record.studentId, name: record.name, session: record.session });
    }
  }

  const rows = [...students.values()]
    .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
    .map((student) => ({
      ...student,
      cells: columns.map((column) => attendanceCellState(byStudentAndDate.get(`${student.studentId}|${column.date}`))),
    }));

  return { range, columns, rows };
}

// The same name search and AM/PM filter the day view uses.
export function filterTableRows(table, { searchQuery = "", filterTime = "all" } = {}) {
  const search = searchQuery.trim().toLowerCase();
  const rows = table.rows.filter((row) => {
    const timeMatch = filterTime === "all" || normalizeAttendanceTime(row.session) === filterTime;
    const searchMatch = search === "" || String(row.name ?? "").toLowerCase().includes(search);
    return timeMatch && searchMatch;
  });
  return { ...table, rows };
}
