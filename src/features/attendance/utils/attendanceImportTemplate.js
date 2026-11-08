import { downloadCsv } from "@utils/exportCsv";
import { IMPORT_HEADERS } from "./attendanceRange.js";

// Fictional sample rows. Names are written as on the Student Info list (first,
// middle and last name) or an attendance export; replace these before importing.
const SAMPLE_ROWS = [
  ["Ana Reyes Cruz", "09/01/2026", "present"],
  ["Ben Santos", "09/01/2026", "absent"],
  ["Carla Dela Cruz", "09/01/2026", "excused"],
];

export function downloadAttendanceImportTemplate() {
  downloadCsv("attendance_import_template.csv", IMPORT_HEADERS, SAMPLE_ROWS);
}
