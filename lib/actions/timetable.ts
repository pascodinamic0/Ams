"use server";

import { revalidatePath } from "next/cache";
import { assertClassAccess } from "@/lib/auth/assert";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import {
  deleteTimetableSlotsForCell,
  findTeacherTimetableConflict,
  replaceTimetableCell,
  upsertTimetableSlot as upsertTimetableSlotDb,
} from "@/lib/db/timetable";
import {
  timetableCellSchema,
  timetableSlotSchema,
  type TimetableCellFormData,
  type TimetableSlotFormData,
} from "@/lib/validations/academic";

const TIMETABLE_MANAGE_ROLES = [...ACADEMIC_PORTAL_ROLES, "teacher"] as const;

async function assertTimetableEntryOwnership(
  entries: Array<{ subject_id: string | null; teacher_id: string | null }>,
  branchId: string,
  schoolId: string
) {
  const supabase = await createClient();
  const subjectIds = [...new Set(entries.map((e) => e.subject_id).filter(Boolean))];
  const teacherIds = [...new Set(entries.map((e) => e.teacher_id).filter(Boolean))];

  if (subjectIds.length > 0) {
    const { data: subjects } = await supabase
      .from("subjects")
      .select("id, branch_id")
      .in("id", subjectIds);
    if ((subjects ?? []).length !== subjectIds.length) {
      return "Subject not found";
    }
    if ((subjects ?? []).some((subject) => subject.branch_id !== branchId)) {
      return "Subject does not belong to this class branch";
    }
  }

  if (teacherIds.length > 0) {
    const { data: teachers } = await supabase
      .from("profiles")
      .select("id, school_id")
      .in("id", teacherIds);
    if ((teachers ?? []).length !== teacherIds.length) {
      return "Teacher not found";
    }
    if ((teachers ?? []).some((teacher) => teacher.school_id !== schoolId)) {
      return "Teacher does not belong to this school";
    }
  }

  return null;
}

export async function saveTimetableCell(input: TimetableCellFormData) {
  const parsed = timetableCellSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid slot data" };

  const { class_id, day, period, entries } = parsed.data;
  const access = await assertClassAccess(class_id, TIMETABLE_MANAGE_ROLES);
  if (!access.ok) return { error: access.error };

  const activeEntries = entries.filter((e) => e.subject_id || e.teacher_id);

  if (activeEntries.length === 0) {
    return clearTimetableSlot(class_id, day, period);
  }

  const ownershipError = await assertTimetableEntryOwnership(
    activeEntries,
    access.branchId!,
    access.schoolId!
  );
  if (ownershipError) return { error: ownershipError };

  for (const entry of activeEntries) {
    if (!entry.teacher_id) continue;
    const conflict = await findTeacherTimetableConflict(
      entry.teacher_id,
      day,
      period,
      class_id,
      entry.start_time,
      entry.end_time,
      entry.id
    );
    if (conflict) {
      const className = conflict.class_name ?? "another class";
      return {
        error: `A teacher is already scheduled in ${className} at this time.`,
        warning: true,
      };
    }
  }

  const result = await replaceTimetableCell(class_id, day, period, activeEntries);
  if (result.error) return { error: result.error };

  revalidatePath("/academic/timetable");
  revalidatePath("/student/timetable");
  revalidatePath("/parent/timetable");
  return {};
}

/** @deprecated Use saveTimetableCell */
export async function upsertTimetableSlot(input: TimetableSlotFormData) {
  const parsed = timetableSlotSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid slot data" };

  const { class_id, day, period, subject_id, teacher_id } = parsed.data;
  const access = await assertClassAccess(class_id, TIMETABLE_MANAGE_ROLES);
  if (!access.ok) return { error: access.error };

  if (!subject_id && !teacher_id) {
    return clearTimetableSlot(class_id, day, period);
  }

  const ownershipError = await assertTimetableEntryOwnership(
    [{ subject_id, teacher_id }],
    access.branchId!,
    access.schoolId!
  );
  if (ownershipError) return { error: ownershipError };

  if (teacher_id) {
    const conflict = await findTeacherTimetableConflict(teacher_id, day, period, class_id);
    if (conflict) {
      const className = conflict.class_name ?? "another class";
      return { error: `This teacher is already scheduled in ${className} at this time.`, warning: true };
    }
  }

  const result = await upsertTimetableSlotDb({
    class_id,
    day,
    period,
    subject_id,
    teacher_id,
  });

  if ("error" in result) return { error: result.error };

  revalidatePath("/academic/timetable");
  return {};
}

export async function clearTimetableSlot(classId: string, day: number, period: number) {
  const access = await assertClassAccess(classId, TIMETABLE_MANAGE_ROLES);
  if (!access.ok) return { error: access.error };

  const result = await deleteTimetableSlotsForCell(classId, day, period);
  if (result.error) return { error: result.error };

  revalidatePath("/academic/timetable");
  revalidatePath("/student/timetable");
  revalidatePath("/parent/timetable");
  return {};
}
