import { downloadCsv } from "@utils/exportCsv";

// Column order mirrors buildCreateData() in ECCD-Backend students.controller.js.
// Deliberately absent: studentCode and teacherId (server-assigned), photo and
// documents (uploaded separately). Import ignores any such columns.
export const IMPORT_TEMPLATE_HEADERS = [
  "firstName", "middleName", "lastName", "suffix",
  "birthday", "gender", "address", "session", "status",
  "primaryGuardianType",
  "motherName", "motherAddress", "motherPhone", "motherEmail",
  "fatherName", "fatherAddress", "fatherPhone", "fatherEmail",
  "guardianName", "guardianAddress", "guardianPhone", "guardianEmail",
  "allergies", "dietary", "specialNotes",
];

// Fictional placeholder data only. Delete these rows before importing.
const SAMPLE_ROWS = [
  ["Juan", "Santos", "Dela Cruz", "", "2022-03-15", "male", "123 Sample St., Sample City", "morning", "active",
    "Mother", "Maria Dela Cruz", "123 Sample St., Sample City", "09170000001", "maria.sample@example.com",
    "", "", "", "", "", "", "", "", "Peanuts", "", ""],
  ["Ana", "", "Reyes", "", "2021-11-02", "female", "45 Example Ave., Sample City", "afternoon", "active",
    "Legal Guardian", "", "", "", "", "", "", "", "",
    "Lola Reyes", "45 Example Ave., Sample City", "09170000002", "", "", "Lactose-free", "Needs a nap at 2 PM"],
];

export function downloadStudentImportTemplate() {
  downloadCsv("student_import_template.csv", IMPORT_TEMPLATE_HEADERS, SAMPLE_ROWS);
}
