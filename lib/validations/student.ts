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

/** Oui/Non selects submit as "true"/"false"/"". */
export const optionalYesNoSchema = z.preprocess((val) => {
  if (val === "" || val == null || val === undefined) return undefined;
  if (val === true || val === "true" || val === "yes") return true;
  if (val === false || val === "false" || val === "no") return false;
  return val;
}, z.boolean().optional());

/** School-year start integer from <select> (empty → undefined). */
export const optionalSchoolYearSchema = z.preprocess((val) => {
  if (val === "" || val == null || val === undefined) return undefined;
  const n = typeof val === "number" ? val : Number(val);
  return Number.isFinite(n) ? n : undefined;
}, z.number().int().min(2000).max(2100).optional());

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
  school_year: optionalSchoolYearSchema,
  place_of_birth: z.string().optional(),
  previous_school: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  responsible_profession: z.string().optional(),
  contact_phone: z.string().optional(),
  address_number: z.string().optional(),
  address_avenue: z.string().optional(),
  address_quartier: z.string().optional(),
  address_commune: z.string().optional(),
  home_address: z.string().optional(),
  chronic_illness: optionalYesNoSchema,
  visual_problem: optionalYesNoSchema,
  physical_problem: optionalYesNoSchema,
  allergies: z.string().optional(),
  difficulties: z.string().optional(),
  notes: z.string().optional(),
  photo_url: z.string().url("invalidPhotoUrl").optional().or(z.literal("")),
});

export type StudentFormData = z.infer<typeof studentSchema>;
