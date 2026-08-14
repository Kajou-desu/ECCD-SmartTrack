import { z } from "zod";

// Schema aligned with StudentForm fields
export const studentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  birthday: z.string().trim().min(1, "Birthday is required"),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
  guardianName: z.string().trim().min(2, "Guardian name is required"),
  guardianPhone: z.string().trim().min(7, "Guardian phone must be at least 7 digits"),
  allergies: z.string().optional(),
  dietary: z.string().optional(),
  specialNotes: z.string().optional(),
  session: z.enum(["morning", "afternoon"]).optional(),
  // allow additional fields (parents, documents) but validate common ones
}).partial();
