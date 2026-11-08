import { test } from "node:test";
import assert from "node:assert/strict";
import { rangeForPeriod, rangeFilename, rangeRows, lateCell, RANGE_HEADERS, IMPORT_HEADERS } from "../src/features/attendance/utils/attendanceRange.js";
import { parseAttendanceCsv } from "../src/features/attendance/utils/importAttendanceCsv.js";
import { profileRows, profileFilename } from "../src/features/students/utils/studentProfileExport.js";

test("day range is the date itself", () => {
  assert.deepEqual(rangeForPeriod("2026-10-07", "day"), { from: "2026-10-07", to: "2026-10-07" });
});

test("week runs Monday to Sunday, for every weekday", () => {
  // 2026-10-05 is a Monday.
  for (const day of ["05", "06", "07", "08", "09", "10", "11"]) {
    assert.deepEqual(rangeForPeriod(`2026-10-${day}`, "week"), { from: "2026-10-05", to: "2026-10-11" }, day);
  }
});

test("week can cross a month and a year boundary", () => {
  assert.deepEqual(rangeForPeriod("2026-10-01", "week"), { from: "2026-09-28", to: "2026-10-04" });
  assert.deepEqual(rangeForPeriod("2027-01-01", "week"), { from: "2026-12-28", to: "2027-01-03" });
});

test("month covers the first to the last day, including leap February", () => {
  assert.deepEqual(rangeForPeriod("2026-10-15", "month"), { from: "2026-10-01", to: "2026-10-31" });
  assert.deepEqual(rangeForPeriod("2026-02-10", "month"), { from: "2026-02-01", to: "2026-02-28" });
  assert.deepEqual(rangeForPeriod("2028-02-10", "month"), { from: "2028-02-01", to: "2028-02-29" });
});

test("a month never exceeds the server's 92-day limit", () => {
  const { from, to } = rangeForPeriod("2026-12-15", "month");
  assert.ok((Date.parse(to) - Date.parse(from)) / 86400000 + 1 <= 92);
});

test("filenames say what the file covers", () => {
  assert.equal(rangeFilename("day", { from: "2026-10-07", to: "2026-10-07" }), "attendance_2026-10-07.csv");
  assert.equal(
    rangeFilename("week", { from: "2026-10-05", to: "2026-10-11" }),
    "attendance_week_2026-10-05_to_2026-10-11.csv",
  );
});

test("range rows use labels, MM/DD/YYYY dates, a Late column, and only show times for present students", () => {
  const rows = rangeRows(
    [
      { date: "2026-10-05", studentCode: "ECCD-2026-1", name: "Ana", session: "morning", status: "present", late: false, arrivedAt: "A", pickedUpAt: "D" },
      { date: "2026-10-05", studentCode: "ECCD-2026-2", name: "Ben", session: "afternoon", status: "absent", late: false, arrivedAt: "A", pickedUpAt: null },
      { date: "2026-10-05", studentCode: "ECCD-2026-3", name: "Cy", session: "morning", status: "present", late: true, arrivedAt: "A", pickedUpAt: null },
    ],
    (v) => `t:${v}`,
  );
  assert.equal(RANGE_HEADERS.length, rows[0].length);
  assert.equal(RANGE_HEADERS[5], "Late");
  assert.deepEqual(rows[0], ["10/05/2026", "ECCD-2026-1", "Ana", "Morning", "Present", "No", "t:A", "t:D"]);
  assert.deepEqual(rows[1], ["10/05/2026", "ECCD-2026-2", "Ben", "Afternoon", "Absent", "", "", ""]);
  assert.equal(rows[2][5], "Yes");
});

test("lateCell is only filled for present students", () => {
  assert.equal(lateCell({ status: "present", late: true }), "Yes");
  assert.equal(lateCell({ status: "present", late: false }), "No");
  assert.equal(lateCell({ status: "excused", late: false }), "");
  assert.equal(lateCell({ status: "absent" }), "");
});

test("the import template's columns are named as in the exports", () => {
  assert.deepEqual(IMPORT_HEADERS, ["Student Name", "Date", "Status"]);
  for (const header of IMPORT_HEADERS) assert.ok(RANGE_HEADERS.includes(header), header);
});

test("attendance CSV: accepts BOM, case-insensitive headers, aliases and M/D/YYYY dates", () => {
  const rows = parseAttendanceCsv("﻿student_name,DATE,Status\r\nAna Cruz,9/5/2026,P\r\nBen Reyes,09/05/2026,Absent\r\n");
  assert.deepEqual(rows, [
    { studentName: "Ana Cruz", date: "2026-09-05", status: "present" },
    { studentName: "Ben Reyes", date: "2026-09-05", status: "absent" },
  ]);
});

test("attendance CSV: an attendance export can be re-imported (extra columns ignored)", () => {
  const csv = '"Date","Student Code","Student Name","Session","Status","Late","Arrived","Picked up"\r\n"10/05/2026","ECCD-2026-1","Ana","Morning","Present","No","8:05 AM",""\r\n';
  assert.deepEqual(parseAttendanceCsv(csv), [{ studentName: "Ana", date: "2026-10-05", status: "present" }]);
});

test("attendance CSV: the template's own sample rows parse", () => {
  const rows = parseAttendanceCsv("Student Name,Date,Status\nAna Reyes Cruz,09/01/2026,present\nCarla Dela Cruz,09/01/2026,excused\n");
  assert.deepEqual(rows.map((r) => [r.studentName, r.date, r.status]), [
    ["Ana Reyes Cruz", "2026-09-01", "present"],
    ["Carla Dela Cruz", "2026-09-01", "excused"],
  ]);
});

test("attendance CSV: semicolon files work", () => {
  assert.equal(parseAttendanceCsv("Student Name;Date;Status\nAna Cruz;10/05/2026;excused\n")[0].status, "excused");
});

test("attendance CSV: students sharing a name are passed through for the server to refuse", () => {
  const rows = parseAttendanceCsv("Student Name,Date,Status\nAna Cruz,10/05/2026,present\nAna Cruz,10/05/2026,absent\n");
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((r) => r.studentName), ["Ana Cruz", "Ana Cruz"]);
});

test("attendance CSV: names keep their commas and quotes", () => {
  const [row] = parseAttendanceCsv('Student Name,Date,Status\n"Cruz, Ana ""Annie""",10/05/2026,present\n');
  assert.equal(row.studentName, 'Cruz, Ana "Annie"');
});

test("attendance CSV: leaves unknown statuses for the server to name", () => {
  const [row] = parseAttendanceCsv("Student Name,Date,Status\nX,10/05/2026,late\n");
  assert.equal(row.status, "late");
});

test("attendance CSV: only MM/DD/YYYY dates are accepted, and the error says which rows", () => {
  const bad = ["2026-10-05", "25/12/2026", "02/30/2026", "13/01/2026", "10/05/26", "Oct 5 2026", ""];
  for (const date of bad) {
    assert.throws(
      () => parseAttendanceCsv(`Student Name,Date,Status\nAna,${date},present\n`),
      /MM\/DD\/YYYY.*Row 2/,
      `date ${JSON.stringify(date)}`,
    );
  }
});

test("attendance CSV: a leap day is real only in a leap year", () => {
  assert.equal(parseAttendanceCsv("Student Name,Date,Status\nAna,02/29/2028,present\n")[0].date, "2028-02-29");
  assert.throws(() => parseAttendanceCsv("Student Name,Date,Status\nAna,02/29/2026,present\n"), /MM\/DD\/YYYY/);
});

test("attendance CSV: lists at most five bad dates and counts the rest", () => {
  const body = Array.from({ length: 8 }, (_, i) => `S${i},2026-10-0${i + 1},present`).join("\n");
  assert.throws(() => parseAttendanceCsv(`Student Name,Date,Status\n${body}`), /Row 6: .*and 3 more/);
});

test("attendance CSV: clear errors for a bad file", () => {
  assert.throws(() => parseAttendanceCsv("Student Name,Date\nX,10/05/2026\n"), /Missing CSV columns: status/);
  assert.throws(() => parseAttendanceCsv("studentCode,date,status\nX,10/05/2026,present\n"), /Missing CSV columns: studentName/);
  assert.throws(() => parseAttendanceCsv("Student Name,Date,Status\n"), /at least one/);
  assert.throws(() => parseAttendanceCsv("Student Name,Date,Status,date\nX,10/05/2026,present,x\n"), /more than once/);
  assert.throws(() => parseAttendanceCsv("Student Name,Date,Status\nX,10/05/2026,pr�sent\n"), /UTF-8/);
});

test("attendance CSV: refuses more than 500 records", () => {
  const body = Array.from({ length: 501 }, (_, i) => `S${i},10/05/2026,present`).join("\n");
  assert.throws(() => parseAttendanceCsv(`Student Name,Date,Status\n${body}`), /limit is 500/);
});

test("profile export: labels, listed guardians only, filename is sanitized", () => {
  const rows = profileRows({
    studentCode: "ECCD-2026-9",
    name: "Ana Cruz",
    birthday: "2022-03-15T00:00:00.000Z",
    gender: "prefer_not_to_say",
    session: "afternoon",
    status: "inactive",
    motherName: "Maria",
    motherPhone: "09171234567",
  });
  const map = Object.fromEntries(rows.map(([k, v]) => [k, v]));
  assert.equal(map.Birthday, "2022-03-15");
  assert.equal(map.Gender, "Prefer not to say");
  assert.equal(map.Session, "Afternoon");
  assert.equal(map.Status, "Inactive");
  assert.deepEqual(map["Mother phone"], { csvText: "09171234567" }); // keeps the leading 0 in Excel
  assert.equal("Father name" in map, false);
  assert.equal(profileFilename({ studentCode: "../ECCD-2026-9" }), "student_ECCD-2026-9.csv");
});
