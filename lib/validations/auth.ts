import { z } from "zod";
import { normalizeStaffPin, STAFF_PIN_PATTERN } from "@/lib/auth/staff-pin";

export const loginSchema = z.object({
  email: z.string().email("invalidEmail"),
  password: z.string().min(1, "passwordRequired"),
});

export const registerSchema = z.object({
  school_name: z.string().min(1, "schoolNameRequired"),
  admin_email: z.string().email("invalidEmail"),
  password: z.string().min(8, "passwordMinLength"),
});

/** Invite / forgot-password setup: exactly 4 digits or 4 letters. */
export const staffPinSchema = z
  .string()
  .regex(STAFF_PIN_PATTERN, "passwordStaffPin");

export const resetPasswordSchema = z
  .object({
    password: staffPinSchema,
    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      normalizeStaffPin(data.password) === normalizeStaffPin(data.confirmPassword),
    {
      message: "passwordsDoNotMatch",
      path: ["confirmPassword"],
    }
  );

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
