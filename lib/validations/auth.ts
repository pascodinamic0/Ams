import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("invalidEmail"),
  password: z.string().min(1, "passwordRequired"),
});

export const registerSchema = z.object({
  school_name: z.string().min(1, "schoolNameRequired"),
  admin_email: z.string().email("invalidEmail"),
  password: z.string().min(8, "passwordMinLength"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "passwordMinLength"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsDoNotMatch",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
