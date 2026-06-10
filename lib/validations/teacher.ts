import { z } from "zod";

export const attendanceStatusSchema = z.enum(["present", "absent"]);

export const attendanceRecordSchema = z.object({
  student_id: z.string().uuid(),
  date: z.string().min(1),
  status: attendanceStatusSchema,
  period: z.coerce.number().int().min(0).default(0),
});

export const saveAttendanceSchema = z.object({
  class_id: z.string().uuid(),
  date: z.string().min(1),
  period: z.coerce.number().int().min(0).default(0),
  records: z.array(attendanceRecordSchema),
});

export const gradeSchema = z.object({
  student_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  class_id: z.string().uuid(),
  term: z.string().min(1),
  marks: z.coerce.number().min(0).max(100).optional().nullable(),
  grade: z.string().optional().nullable(),
});

export const upsertGradesSchema = z.object({
  grades: z.array(gradeSchema),
});

export const assignmentSchema = z.object({
  class_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().optional().nullable(),
});

export type AttendanceRecordFormData = z.infer<typeof attendanceRecordSchema>;
export type SaveAttendanceFormData = z.infer<typeof saveAttendanceSchema>;
export type GradeFormData = z.infer<typeof gradeSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
