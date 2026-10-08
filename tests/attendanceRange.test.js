import { test } from "node:test";
import assert from "node:assert/strict";
import { rangeForPeriod, rangeFilename, rangeRows, RANGE_HEADERS } from "../src/features/attendance/utils/attendanceRange.js";
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

test("range rows use labels and only show times for present students", () => {
  const rows = rangeRows(
    [
      { date: "2026-10-05", studentCode: "ECCD-2026-1", name: "Ana", session: "morning", status: "present", arrivedAt: "A", departedAt: "D" },
      { date: "2026-10-05", studentCode: "ECCD-2026-2", name: "Ben", session: "afternoon", status: "absent", arrivedAt: "A", departedAt: null },
    ],
    (v) => `t:${v}`,
  );
  assert.equal(RANGE_HEADERS.length, rows[0].length);
  assert.deepEqual(rows[0], ["2026-10-05", "ECCD-2026-1", "Ana", "Morning", "Present", "t:A", "t:D"]);
  assert.deepEqual(rows[1], ["2026-10-05", "ECCD-2026-2", "Ben", "Afternoon", "Absent", "", ""]);
});

test("attendance CSV: accepts BOM, case-insensitive headers, aliases and loose dates", () => {
  const rows = parseAttendanceCsv("﻿Student Code,DATE,Status\r\nECCD-2026-1,2026/9/5,P\r\nECCD-2026-2,2026-09-05,Absent\r\n");
  assert.deepEqual(rows, [
    { studentCode: "ECCD-2026-1", date: "2026-09-05", status: "present" },
    { studentCode: "ECCD-2026-2", date: "2026-09-05", status: "absent" },
  ]);
});

test("attendance CSV: an attendance export can be re-imported (extra columns ignored)", () => {
  const csv = '"Date","Student Code","Name","Session","Status","Arrived","Departed"\r\n"2026-10-05","ECCD-2026-1","Ana","Morning","Present","8:05 AM",""\r\n';
  assert.deepEqual(parseAttendanceCsv(csv), [{ studentCode: "ECCD-2026-1", date: "2026-10-05", status: "present" }]);
});

test("attendance CSV: semicolon files work", () => {
  assert.equal(parseAttendanceCsv("studentCode;date;status\nECCD-2026-1;2026-10-05;excused\n")[0].status, "excused");
});

test("attendance CSV: leaves ambiguous dates and unknown statuses for the server to name", () => {
  const [row] = parseAttendanceCsv("studentCode,date,status\nX,05/10/2026,late\n");
  assert.equal(row.date, "05/10/2026");
  assert.equal(row.status, "late");
});

test("attendance CSV: clear errors for a bad file", () => {
  assert.throws(() => parseAttendanceCsv("studentCode,date\nX,2026-10-05\n"), /Missing CSV columns: status/);
  assert.throws(() => parseAttendanceCsv("studentCode,date,status\n"), /at least one/);
  assert.throws(() => parseAttendanceCsv("studentCode,date,status,date\nX,2026-10-05,present,x\n"), /more than once/);
  assert.throws(() => parseAttendanceCsv("studentCode,date,status\nX,2026-10-05,pr�sent\n"), /UTF-8/);
});

test("attendance CSV: refuses more than 500 records", () => {
  const body = Array.from({ length: 501 }, (_, i) => `S${i},2026-10-05,present`).join("\n");
  assert.throws(() => parseAttendanceCsv(`studentCode,date,status\n${body}`), /limit is 500/);
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
