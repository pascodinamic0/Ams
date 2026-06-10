import { z } from "zod";

export const INVITABLE_ROLES = [
  "academic_admin",
  "teacher",
  "finance_officer",
  "operations_manager",
  "analytics",
] as const;

export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  role: z.enum([
    "academic_admin",
    "teacher",
    "finance_officer",
    "operations_manager",
    "analytics",
  ]),
});

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;
