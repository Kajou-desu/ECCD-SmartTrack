// Spreadsheet apps (Excel, Sheets, LibreOffice) run a cell as a formula when
// its text starts with one of these — so a name like =HYPERLINK("http://evil",...)
// that reaches an export would execute on whoever opens the file. Values here
// include text people typed (their own names, student names), so it is not safe
// to assume it's inert.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

// Quotes a cell for CSV and neutralizes formula injection by prefixing a
// single quote (the OWASP-recommended fix), which spreadsheets treat as
// "this is text". Only strings are prefixed: a real number such as -5 is
// data, not something a person typed, and must stay a number.
export function escapeCsvValue(value) {
    let text = String(value ?? "");
    if (typeof value === "string" && FORMULA_TRIGGER.test(text)) {
        text = `'${text}`;
    }
    return `"${text.replace(/"/g, '""')}"`;
}

// Marks a cell as text so Excel does not turn "09171234567" into 9171234567.
// Written as ="09171234567". Only used for values made purely of phone
// characters (digits + - ( ) and spaces), which cannot contain a quote or any
// other formula syntax; anything else falls back to the normal escaped cell.
const PHONE_CHARS = /^[0-9+\-\s()]+$/;

export function csvText(value) {
    return { csvText: String(value ?? "") };
}

function toCell(value) {
    if (value && typeof value === "object" && "csvText" in value) {
        const text = value.csvText;
        return PHONE_CHARS.test(text) ? `="${text}"` : escapeCsvValue(text);
    }
    return escapeCsvValue(value);
}

// UTF-8 byte-order mark: without it Excel reads the file as ANSI and garbles
// accented names (Peña, Niño).
const UTF8_BOM = "\uFEFF";

// Triggers a client-side CSV download. No backend involved.
export function downloadCsv(filename, headers, rows) {
    const csvRows = rows.map((row) => row.map(toCell).join(","));
    // RFC 4180 line endings; headers quoted like every other cell.
    const csv = [headers.map(escapeCsvValue).join(","), ...csvRows].join("\r\n");

    const blob = new Blob([UTF8_BOM, csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}