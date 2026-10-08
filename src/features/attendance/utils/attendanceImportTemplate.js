import { downloadCsv } from "@utils/exportCsv";
import { IMPORT_HEADERS } from "./attendanceRange.js";

// Fictional sample rows. Student codes come from the Student Info list or from
// an attendance export; replace these before importing.
const SAMPLE_ROWS = [
  ["ECCD-2026-1", "2026-09-01", "present"],
  ["ECCD-2026-2", "2026-09-01", "absent"],
  ["ECCD-2026-3", "2026-09-01", "excused"],
];

export function downloadAttendanceImportTemplate() {
  downloadCsv("attendance_import_template.csv", IMPORT_HEADERS, SAMPLE_ROWS);
}
