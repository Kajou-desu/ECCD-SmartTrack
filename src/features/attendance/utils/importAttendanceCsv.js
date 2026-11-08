// CSV parsing for the attendance import. Same conventions as the student
// import (BOM, delimiter detection, case-insensitive headers) and the same
// row numbering as the server: the header is row 1.
import { splitRows, detectDelimiter, columnKey, MAX_IMPORT_BYTES } from "../../students/utils/importCsv.js";
import { parseUsDate } from "../../../utils/usDate.js";

export const MAX_ATTENDANCE_IMPORT_ROWS = 500; // the server's per-request limit
export { MAX_IMPORT_BYTES };

// "Student Name", "student_name" and "studentName" are all the same column.
const REQUIRED = ["studentName", "date", "status"];
const STATUS_ALIASES = { present: "present", p: "present", absent: "absent", a: "absent", excused: "excused", e: "excused" };
const MAX_DATE_PROBLEMS_SHOWN = 5;

export function parseAttendanceCsv(rawText) {
  if (rawText.includes("\uFFFD")) {
    throw new Error(
      "This file isn't saved as UTF-8, so some characters were garbled. In Excel use Save As → CSV UTF-8 and try again.",
    );
  }
  const text = rawText.replace(/^\uFEFF/, "");
  const rows = splitRows(text, detectDelimiter(text));
  if (rows.length < 2) throw new Error("CSV must include a header and at least one attendance record.");
  if (rows.length - 1 > MAX_ATTENDANCE_IMPORT_ROWS) {
    throw new Error(
      `This file has ${rows.length - 1} records; the limit is ${MAX_ATTENDANCE_IMPORT_ROWS} per import. Split it into smaller files.`,
    );
  }

  const canonical = new Map(REQUIRED.map((column) => [columnKey(column), column]));
  const headers = rows[0].map((header) => canonical.get(columnKey(header)) ?? header);
  const seen = new Set();
  for (const header of headers) {
    if (header && seen.has(header)) throw new Error(`Column "${header}" appears more than once.`);
    seen.add(header);
  }
  const missing = REQUIRED.filter((column) => !seen.has(column));
  if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(", ")}`);

  const dateProblems = [];
  const records = rows.slice(1).map((values, index) => {
    const record = {};
    headers.forEach((header, column) => {
      if (REQUIRED.includes(header)) record[header] = values[column] ?? "";
    });
    // The CSV's MM/DD/YYYY becomes the server's YYYY-MM-DD. Checked here, not
    // left to the server, so a wrong format is named as such (the server's own
    // message talks about YYYY-MM-DD) and one wrong file isn't read as another
    // date format.
    const date = parseUsDate(record.date);
    if (date) record.date = date;
    else dateProblems.push(`Row ${index + 2}: "${record.date}"`);
    record.status = STATUS_ALIASES[String(record.status).trim().toLowerCase()] ?? record.status;
    return record;
  });

  if (dateProblems.length) {
    const shown = dateProblems.slice(0, MAX_DATE_PROBLEMS_SHOWN).join("; ");
    const more = dateProblems.length > MAX_DATE_PROBLEMS_SHOWN ? ` and ${dateProblems.length - MAX_DATE_PROBLEMS_SHOWN} more` : "";
    throw new Error(`Dates must be real dates written as MM/DD/YYYY, like 09/01/2026. ${shown}${more}.`);
  }
  return records;
}
