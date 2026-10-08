// Rows for the one-student export. Free of React and aliased imports so it can
// be unit-tested directly. Values are display labels, not raw enum values.
import { csvText } from "../../../utils/exportCsv.js";

const GENDER_LABELS = { male: "Male", female: "Female", other: "Other", prefer_not_to_say: "Prefer not to say" };
const SESSION_LABELS = { morning: "Morning", afternoon: "Afternoon" };

const phone = (value) => (value ? csvText(value) : "");

// A guardian row is only listed when the record has that person's name.
function guardianRows(label, name, phoneNumber, email, address) {
  if (!name) return [];
  return [
    [`${label} name`, name],
    [`${label} phone`, phone(phoneNumber)],
    [`${label} email`, email ?? ""],
    [`${label} address`, address ?? ""],
  ];
}

export const PROFILE_HEADERS = ["Field", "Value"];

export function profileRows(student) {
  return [
    ["Student code", student.studentCode ?? ""],
    ["Name", student.name ?? ""],
    ["Birthday", String(student.birthday ?? "").slice(0, 10)],
    ["Gender", GENDER_LABELS[student.gender] ?? student.gender ?? ""],
    ["Session", SESSION_LABELS[student.session] ?? ""],
    ["Status", student.status === "active" ? "Active" : "Inactive"],
    ["Address", student.address ?? ""],
    ["Teacher", student.teacher ?? ""],
    ["Primary guardian", student.primaryGuardianType ?? ""],
    ...guardianRows("Mother", student.motherName, student.motherPhone, student.motherEmail, student.motherAddress),
    ...guardianRows("Father", student.fatherName, student.fatherPhone, student.fatherEmail, student.fatherAddress),
    ...guardianRows("Guardian", student.guardianName, student.guardianPhone, student.guardianEmail, student.guardianAddress),
    ["Allergies", student.allergies ?? ""],
    ["Dietary notes", student.dietary ?? ""],
    ["Special notes", student.specialNotes ?? ""],
  ];
}

// "ECCD-2026-12" -> student_ECCD-2026-12.csv. Anything unexpected in the code
// is dropped so it can't produce a odd filename.
export function profileFilename(student) {
  const code = String(student.studentCode ?? "student").replace(/[^A-Za-z0-9-]/g, "");
  return `student_${code || "student"}.csv`;
}
