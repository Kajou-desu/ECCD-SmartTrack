// CSV parsing for the attendance import. Same conventions as the student
// import (BOM, delimiter detection, case-insensitive headers) and the same
// row numbering as the server: the header is row 1.
import { splitRows, detectDelimiter, columnKey, MAX_IMPORT_BYTES } from "../../students/utils/importCsv.js";

export const MAX_ATTENDANCE_IMPORT_ROWS = 500; // the server's per-request limit
export { MAX_IMPORT_BYTES };

const REQUIRED = ["studentCode", "date", "status"];
const STATUS_ALIASES = { present: "present", p: "present", absent: "absent", a: "absent", excused: "excused", e: "excused" };

// 2026-9-5, 2026/09/05 and 2026.09.05 are unambiguous. 05/09/2026 is not, so
// it is left for the server to reject rather than guessed at.
function normalizeDate(value) {
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(String(value).trim());
  return match ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}` : value;
}

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

  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, column) => {
      if (REQUIRED.includes(header)) record[header] = values[column] ?? "";
    });
    record.date = normalizeDate(record.date);
    record.status = STATUS_ALIASES[String(record.status).trim().toLowerCase()] ?? record.status;
    return record;
  });
}
