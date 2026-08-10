import { z } from "zod";

export const studentSchema = z.object({
  name: z
    .string({ required_error: "Student name is required" })
    .trim()
    .min(2, "Student name must be at least 2 characters"),
  age: z
    .string({ required_error: "Age is required" })
    .trim()
    .min(1, "Age is required"),
  birthday: z
    .string({ required_error: "Birthday is required" })
    .trim()
    .min(1, "Birthday is required"),
  guardianName: z
    .string({ required_error: "Guardian name is required" })
    .trim()
    .min(2, "Guardian name must be at least 2 characters"),
  guardianPhone: z
    .string({ required_error: "Guardian phone is required" })
    .trim()
    .min(7, "Guardian phone must be at least 7 digits"),
  address: z
    .string({ required_error: "Address is required" })
    .trim()
    .min(5, "Address must be at least 5 characters"),
  allergies: z.string().optional(),
  dietary: z.string().optional(),
});
