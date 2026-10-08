// CSV parsing for the student import. Kept free of React and aliased imports
// so it can be unit-tested directly.

export const MAX_IMPORT_ROWS = 500; // the server's per-request limit
// The server's JSON body limit is 1 MB. A CSV is smaller than the JSON built
// from it, so this keeps well clear of a failure that only shows after upload.
export const MAX_IMPORT_BYTES = 700 * 1024;

export const REQUIRED_COLUMNS = ["firstName", "lastName", "birthday", "gender", "address"];
// The server requires at least one of these names per row; the client only
// checks that the file has at least one such column at all.
export const NAME_COLUMNS = ["motherName", "fatherName", "guardianName"];

export const columnKey = (header) => String(header).toLowerCase().replace(/[\s_-]/g, "");

export function detectDelimiter(text) {
  // Excel in many locales (including some PH/EU setups) saves "CSV" with ";".
  const firstLine = text.split(/\r\n|\n|\r/, 1)[0] ?? "";
  const counts = { ",": 0, ";": 0, "\t": 0 };
  for (const char of firstLine) if (char in counts) counts[char] += 1;
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : ",";
}

export function splitRows(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"' && quoted) {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some((value) => value)) rows.push(row);
  return rows;
}

const GENDER_ALIASES = {
  male: "male", m: "male", boy: "male",
  female: "female", f: "female", girl: "female",
  other: "other", o: "other",
  "prefer not to say": "prefer_not_to_say", prefer_not_to_say: "prefer_not_to_say",
};
const SESSION_ALIASES = { morning: "morning", am: "morning", afternoon: "afternoon", pm: "afternoon" };
const STATUS_ALIASES = { active: "active", inactive: "inactive" };

// Maps friendly spellings to the exact values the server accepts. Anything
// unrecognized is left untouched so the server's own message names it.
function alias(value, table) {
  return table[String(value).trim().toLowerCase()] ?? value;
}

// 2022-3-5, 2022/03/05 and 2022.03.05 are unambiguous. 15/03/2022 vs
// 03/15/2022 is not, so those are left for the server to reject rather than
// guessed at (a wrong guess would store the wrong birthday).
function normalizeBirthday(value) {
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(String(value).trim());
  return match ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}` : value;
}

export function parseStudentCsv(rawText, knownColumns = []) {
  if (rawText.includes("\uFFFD")) {
    throw new Error(
      "This file isn't saved as UTF-8, so some characters were garbled. In Excel use Save As \u2192 CSV UTF-8 and try again.",
    );
  }
  const text = rawText.replace(/^\uFEFF/, ""); // Excel's "CSV UTF-8" adds a BOM
  const rows = splitRows(text, detectDelimiter(text));
  if (rows.length < 2) throw new Error("CSV must include a header and at least one student.");
  if (rows.length - 1 > MAX_IMPORT_ROWS) {
    throw new Error(`This file has ${rows.length - 1} students; the limit is ${MAX_IMPORT_ROWS} per import. Split it into smaller files.`);
  }

  // Headers match regardless of case, spaces and underscores (First Name,
  // first_name and firstName are all firstName).
  const canonicalByKey = new Map(knownColumns.map((column) => [columnKey(column), column]));
  const headers = rows[0].map((header) => canonicalByKey.get(columnKey(header)) ?? header);

  const seen = new Set();
  for (const header of headers) {
    if (header && seen.has(header)) throw new Error(`Column "${header}" appears more than once.`);
    seen.add(header);
  }

  const missing = REQUIRED_COLUMNS.filter((column) => !seen.has(column));
  if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(", ")}`);
  if (!NAME_COLUMNS.some((column) => seen.has(column))) {
    throw new Error(`Add at least one of these columns: ${NAME_COLUMNS.join(", ")}`);
  }

  return rows.slice(1).map((values, index) => {
    // Cells past the last header would be silently dropped, usually because of
    // an unquoted comma inside an address. Row numbers match the server's
    // (the header is row 1).
    if (values.length > headers.length && values.slice(headers.length).some((cell) => cell)) {
      throw new Error(`Row ${index + 2} has more values than there are columns. Put quotes around any value that contains a comma.`);
    }
    const record = {};
    headers.forEach((header, column) => {
      record[header] = values[column] ?? "";
    });
    if (record.gender) record.gender = alias(record.gender, GENDER_ALIASES);
    if (record.session) record.session = alias(record.session, SESSION_ALIASES);
    if (record.status) record.status = alias(record.status, STATUS_ALIASES);
    if (record.birthday) record.birthday = normalizeBirthday(record.birthday);
    return record;
  });
}
