import { z } from "zod";
import { toDayKey } from "../utils/dateKeys.js";

// These mirror the backend's limits (students.controller.js / validate.js) so
// a bad value is flagged next to the field instead of coming back from the
// server as a rejected save.
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;
const MIN_BIRTH_YEAR = 1900;

const optionalText = (max, label) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`).optional();

const optionalPhone = (label) =>
  z.string().trim().refine((value) => !value || PHONE_RE.test(value), `${label} must be 7-20 digits (digits, + - ( ) and spaces only)`).optional();

const optionalEmail = (label) =>
  z.string().trim().max(254, `${label} is too long`).refine((value) => !value || z.string().email().safeParse(value).success, `Enter a valid ${label.toLowerCase()}`).optional();

// Schema aligned with StudentForm fields
export const studentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name must be at most 100 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name must be at most 100 characters"),
  middleName: optionalText(100, "Middle name"),
  suffix: optionalText(20, "Suffix"),
  birthday: z
    .string()
    .trim()
    .min(1, "Birthday is required")
    .refine(
      (value) => {
        const year = Number(value.slice(0, 4));
        return year >= MIN_BIRTH_YEAR && value <= toDayKey();
      },
      "Birthday must be a real date that is not in the future",
    ),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Gender is required",
    invalid_type_error: "Gender is required",
  }),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),
  motherName: optionalText(200, "Mother's name"),
  fatherName: optionalText(200, "Father's name"),
  guardianName: optionalText(200, "Guardian's name"),
  motherPhone: optionalPhone("Mother's phone"),
  fatherPhone: optionalPhone("Father's phone"),
  guardianPhone: optionalPhone("Guardian's phone"),
  motherEmail: optionalEmail("Mother's email"),
  fatherEmail: optionalEmail("Father's email"),
  guardianEmail: optionalEmail("Guardian's email"),
  allergies: optionalText(1000, "Allergies"),
  dietary: optionalText(1000, "Dietary notes"),
  specialNotes: optionalText(2000, "Special notes"),
  session: z.enum(["morning", "afternoon"]).optional(),
  // Allow additional fields (parents, documents) while keeping the core fields required.
}).passthrough().superRefine((student, context) => {
  if (!student.motherName && !student.fatherName && !student.guardianName) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["guardianName"],
      message: "At least one parent or guardian name is required",
    });
  }
});
