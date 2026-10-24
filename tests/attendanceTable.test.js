import { test } from "node:test";
import assert from "node:assert/strict";
import { attendanceCellState, buildAttendanceTable, filterTableRows } from "../src/features/attendance/utils/attendanceTable.js";

const roster = [
  { id: 1, name: "Ana Cruz", session: "morning" },
  { id: 2, name: "Ben Lim", session: "afternoon" },
];

test("a cell is present, late, absent, excused, or none", () => {
  assert.equal(attendanceCellState({ status: "present", late: false }), "present");
  assert.equal(attendanceCellState({ status: "present", late: true }), "late");
  assert.equal(attendanceCellState({ status: "absent", late: false }), "absent");
  assert.equal(attendanceCellState({ status: "excused" }), "excused");
  assert.equal(attendanceCellState(undefined), "none");
  assert.equal(attendanceCellState({ status: null }), "none");
});

test("a late flag never changes an absent or excused record", () => {
  assert.equal(attendanceCellState({ status: "absent", late: true }), "absent");
});

test("week table has Monday to Friday columns of the selected date's week", () => {
  const { columns, range } = buildAttendanceTable({ period: "week", selectedDate: "2026-10-07", roster });
  assert.deepEqual(range, { from: "2026-10-05", to: "2026-10-11" });
  assert.deepEqual(columns.map((c) => c.weekday), ["Mon", "Tue", "Wed", "Thu", "Fri"]);
  assert.deepEqual(columns.map((c) => c.date), ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09"]);
});

test("each student's cells line up with the day columns", () => {
  const records = [
    { studentId: 1, date: "2026-10-05", status: "present", late: false },
    { studentId: 1, date: "2026-10-06", status: "present", late: true },
    { studentId: 1, date: "2026-10-07", status: "absent", late: false },
    { studentId: 2, date: "2026-10-09", status: "excused", late: false },
  ];
  const { rows } = buildAttendanceTable({ period: "week", selectedDate: "2026-10-07", roster, records });
  assert.deepEqual(rows.find((r) => r.studentId === 1).cells, ["present", "late", "absent", "none", "none"]);
  assert.deepEqual(rows.find((r) => r.studentId === 2).cells, ["none", "none", "none", "none", "excused"]);
});

test("a student with no records in the period still gets a row", () => {
  const { rows } = buildAttendanceTable({ period: "week", selectedDate: "2026-10-07", roster, records: [] });
  assert.equal(rows.length, 2);
  assert.ok(rows.every((r) => r.cells.every((c) => c === "none")));
});

test("a student only present in the records (since withdrawn) is still listed", () => {
  const records = [{ studentId: 9, name: "Zed Old", session: "morning", date: "2026-10-05", status: "present", late: false }];
  const { rows } = buildAttendanceTable({ period: "week", selectedDate: "2026-10-05", roster, records });
  assert.deepEqual(rows.map((r) => r.studentId), [1, 2, 9]);
});

test("month table has one column per school day, weekends skipped", () => {
  const { columns } = buildAttendanceTable({ period: "month", selectedDate: "2026-10-15", roster });
  // October 2026: 31 days, 22 weekdays (starts on a Thursday).
  assert.equal(columns.length, 22);
  assert.equal(columns[0].date, "2026-10-01");
  assert.equal(columns.at(-1).date, "2026-10-30");
  assert.ok(columns.every((c) => !["Sat", "Sun"].includes(c.weekday)));
});

test("a weekend with recorded attendance gets a column so a make-up class is not hidden", () => {
  const records = [{ studentId: 1, date: "2026-10-10", status: "present", late: false }]; // a Saturday
  const { columns, rows } = buildAttendanceTable({ period: "week", selectedDate: "2026-10-07", roster, records });
  assert.deepEqual(columns.map((c) => c.weekday), ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  assert.equal(rows.find((r) => r.studentId === 1).cells.at(-1), "present");
});

test("month crossing a year keeps its own dates (December)", () => {
  const { range, columns } = buildAttendanceTable({ period: "month", selectedDate: "2026-12-15", roster });
  assert.deepEqual(range, { from: "2026-12-01", to: "2026-12-31" });
  assert.equal(columns[0].date, "2026-12-01");
});

test("rows are filtered by name search and by AM/PM, like the day view", () => {
  const table = buildAttendanceTable({ period: "week", selectedDate: "2026-10-07", roster });
  assert.deepEqual(filterTableRows(table, { searchQuery: " ana " }).rows.map((r) => r.studentId), [1]);
  assert.deepEqual(filterTableRows(table, { filterTime: "pm" }).rows.map((r) => r.studentId), [2]);
  assert.deepEqual(filterTableRows(table, { filterTime: "am", searchQuery: "ben" }).rows, []);
  assert.equal(filterTableRows(table).rows.length, 2);
});
