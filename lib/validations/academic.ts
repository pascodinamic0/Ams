import { z } from "zod";

export const classSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  branch_id: z.string().uuid("branchRequired"),
  grade: z.string().optional(),
  capacity: z.number().int().positive().nullable().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  branch_id: z.string().uuid("branchRequired"),
});

export const branchSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  school_id: z.string().uuid("schoolRequired"),
  address: z.string().optional(),
});

export const admissionPickupPersonSchema = z.object({
  full_name: z.string().min(1, "nameRequired"),
  phone: z.string().min(1, "phoneRequired"),
  relationship: z.string().min(1, "relationshipRequired"),
  notes: z.string().optional(),
});

const admissionBaseSchema = z.object({
  student_name: z.string().min(1, "studentNameRequired"),
  dob: z.string().optional(),
  gender: z.string().optional(),
  class_applying: z.string().optional(),
  guardian_name: z.string().min(1, "guardianNameRequired"),
  guardian_email: z.string().email("invalidEmail"),
  guardian_phone: z.string().optional(),
  relation: z.enum(["father", "mother", "guardian", "other"]).default("guardian"),
  address: z.string().optional(),
  notes: z.string().optional(),
  guardian_can_pickup: z.boolean().default(false),
  pickup_persons: z.array(admissionPickupPersonSchema).default([]),
});

function refinePickupAuthorization<T extends {
  guardian_can_pickup?: boolean;
  pickup_persons?: unknown[];
}>(data: T, ctx: z.RefinementCtx) {
  if (!data.guardian_can_pickup && (data.pickup_persons?.length ?? 0) === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "pickupAuthorizationRequired",
      path: ["pickup_persons"],
    });
  }
}

export const admissionSchema = admissionBaseSchema.superRefine(refinePickupAuthorization);

export const onlineEnrollmentSchema = admissionBaseSchema
  .extend({
    dob: z.string().min(1, "dobRequired"),
    class_applying: z.string().min(1, "gradeOrClassRequired"),
    guardian_phone: z.string().min(1, "phoneRequired"),
    address: z.string().min(1, "addressRequired"),
  })
  .superRefine(refinePickupAuthorization);
const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "invalidTime")
  .nullable();

export const timetableSlotEntrySchema = z.object({
  id: z.string().uuid().optional(),
  subject_id: z.string().uuid().nullable(),
  teacher_id: z.string().uuid().nullable(),
  start_time: timeStringSchema,
  end_time: timeStringSchema,
});

export const timetableCellSchema = z.object({
  class_id: z.string().uuid(),
  day: z.number().int().min(0).max(6),
  period: z.number().int().min(1).max(12),
  entries: z.array(timetableSlotEntrySchema),
});

/** @deprecated Use timetableCellSchema for multi-subject cells */
export const timetableSlotSchema = z.object({
  class_id: z.string().uuid(),
  day: z.number().int().min(0).max(6),
  period: z.number().int().min(1).max(12),
  subject_id: z.string().uuid().nullable(),
  teacher_id: z.string().uuid().nullable(),
});

export const studentImportRowSchema = z.object({
  first_name: z.string().min(1, "firstNameRequired"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "lastNameRequired"),
  date_of_birth: z.string().min(1, "dobRequired"),
  class_id: z.string().uuid().optional(),
  status: z.enum(["active", "graduated", "inactive"]).default("active"),
});

export type ClassFormData = z.infer<typeof classSchema>;
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type BranchFormData = z.infer<typeof branchSchema>;
export type AdmissionFormData = z.infer<typeof admissionSchema>;
export type OnlineEnrollmentFormData = z.infer<typeof onlineEnrollmentSchema>;
export type TimetableSlotFormData = z.infer<typeof timetableSlotSchema>;
export type TimetableCellFormData = z.infer<typeof timetableCellSchema>;
export type TimetableSlotEntryFormData = z.infer<typeof timetableSlotEntrySchema>;
export type StudentImportRow = z.infer<typeof studentImportRowSchema>;
