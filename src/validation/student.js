import { z } from "zod";

// Schema aligned with StudentForm fields
export const studentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  birthday: z.string().trim().min(1, "Birthday is required"),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
  motherName: z.string().trim().optional(),
  fatherName: z.string().trim().optional(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().refine(
    (value) => !value || value.length >= 7,
    "Guardian phone must be at least 7 digits",
  ).optional(),
  allergies: z.string().optional(),
  dietary: z.string().optional(),
  specialNotes: z.string().optional(),
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
