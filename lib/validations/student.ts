import { z } from "zod";
import { STUDENT_TAGS } from "@/lib/students/tags";

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

export const STUDENT_STATUSES = [
  "active",
  "pending",
  "inactive",
  "graduated",
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

/** Empty select placeholder is stored as null. */
export const optionalGenderSchema = z.preprocess(
  (val) => (val === "" || val == null ? undefined : val),
  z.enum(GENDERS, { error: "invalidGender" }).optional()
);

export function normalizeGender(
  value: string | null | undefined
): Gender | null {
  const key = (value ?? "").trim().toLowerCase();
  return key === "male" || key === "female" ? key : null;
}

export const studentTagSchema = z.enum(STUDENT_TAGS);

export const studentSchema = z.object({
  first_name: z.string().min(1, "firstNameRequired"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "lastNameRequired"),
  date_of_birth: z.string().min(1, "dobRequired"),
  gender: optionalGenderSchema,
  class_id: z.string().uuid("classRequired"),
  status: z.enum(STUDENT_STATUSES).default("active"),
  tags: z.array(studentTagSchema).default([]),
  home_address: z.string().optional(),
  notes: z.string().optional(),
  photo_url: z.string().url("invalidPhotoUrl").optional().or(z.literal("")),
});

export type StudentFormData = z.infer<typeof studentSchema>;
