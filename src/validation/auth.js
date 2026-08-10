import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please enter a valid email address")
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export const PasswordResetSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Please enter a valid email address")
      .transform((value) => value.toLowerCase()),
    otpCode: z
      .string({ required_error: "OTP is required" })
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^[0-9]+$/, "OTP must contain only numbers"),
    newPassword: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
    confirmPassword: z.string({ required_error: "Confirmation is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
