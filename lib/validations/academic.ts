import { z } from "zod";

export const sectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  branch_id: z.string().uuid("Branch is required"),
});

export const classSchema = z.object({
  name: z.string().min(1, "Name is required"),
  branch_id: z.string().uuid("Branch is required"),
  grade: z.string().optional(),
  section_id: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  branch_id: z.string().uuid("Branch is required"),
});

export const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  school_id: z.string().uuid("School is required"),
  address: z.string().optional(),
});

export const admissionSchema = z.object({
  student_name: z.string().min(1, "Student name is required"),
  dob: z.string().optional(),
  gender: z.string().optional(),
  class_applying: z.string().optional(),
  guardian_name: z.string().min(1, "Guardian name is required"),
  guardian_email: z.string().email("Invalid email"),
  guardian_phone: z.string().optional(),
  relation: z.enum(["father", "mother", "guardian", "other"]).default("guardian"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const onlineEnrollmentSchema = admissionSchema.extend({
  dob: z.string().min(1, "Date of birth is required"),
  class_applying: z.string().min(1, "Grade or class is required"),
  guardian_phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time")
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

export const curriculumSchema = z.object({
  branch_id: z.string().uuid("Branch is required"),
  grade: z.string().min(1, "Grade is required"),
  subject_id: z.string().uuid("Subject is required"),
  syllabus: z.string().optional(),
});

export const studentImportRowSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  class_id: z.string().uuid().optional(),
  status: z.enum(["active", "graduated", "inactive"]).default("active"),
});

export type SectionFormData = z.infer<typeof sectionSchema>;
export type ClassFormData = z.infer<typeof classSchema>;
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type BranchFormData = z.infer<typeof branchSchema>;
export type AdmissionFormData = z.infer<typeof admissionSchema>;
export type OnlineEnrollmentFormData = z.infer<typeof onlineEnrollmentSchema>;
export type TimetableSlotFormData = z.infer<typeof timetableSlotSchema>;
export type TimetableCellFormData = z.infer<typeof timetableCellSchema>;
export type TimetableSlotEntryFormData = z.infer<typeof timetableSlotEntrySchema>;
export type CurriculumFormData = z.infer<typeof curriculumSchema>;
export type StudentImportRow = z.infer<typeof studentImportRowSchema>;
