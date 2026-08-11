import { z } from "zod";

export const INVITABLE_ROLES = [
  "academic_admin",
  "admin_coordinator",
  "registrar",
  "admissions_officer",
  "pedagogy_coordinator",
  "principal",
  "teacher",
  "finance_officer",
  "cashier",
  "accountant",
  "operations_manager",
  "operations_officer",
  "discipline_officer",
  "supervisor",
  "pedagogical_council_member",
  "analytics",
] as const;

export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  role: z.enum([
    "academic_admin",
    "admin_coordinator",
    "registrar",
    "admissions_officer",
    "pedagogy_coordinator",
    "principal",
    "teacher",
    "finance_officer",
    "cashier",
    "accountant",
    "operations_manager",
    "operations_officer",
    "discipline_officer",
    "supervisor",
    "pedagogical_council_member",
    "analytics",
  ]),
});

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;

export const updateTeamMemberRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: inviteUserSchema.shape.role,
});

export type UpdateTeamMemberRoleFormData = z.infer<
  typeof updateTeamMemberRoleSchema
>;

export const removeTeamMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export type RemoveTeamMemberFormData = z.infer<typeof removeTeamMemberSchema>;
