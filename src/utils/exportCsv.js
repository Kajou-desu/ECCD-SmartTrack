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

// Triggers a client-side CSV download. No backend involved.
export function downloadCsv(filename, headers, rows) {
    const csvRows = rows.map((row) => row.map(escapeCsvValue).join(","));
    const csv = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}