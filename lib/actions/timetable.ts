"use server";

import { revalidatePath } from "next/cache";
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

export async function saveTimetableCell(input: TimetableCellFormData) {
  const parsed = timetableCellSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid slot data" };

  const { class_id, day, period, entries } = parsed.data;
  const activeEntries = entries.filter((e) => e.subject_id || e.teacher_id);

  if (activeEntries.length === 0) {
    return clearTimetableSlot(class_id, day, period);
  }

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

  if (!subject_id && !teacher_id) {
    return clearTimetableSlot(class_id, day, period);
  }

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
  const result = await deleteTimetableSlotsForCell(classId, day, period);
  if (result.error) return { error: result.error };

  revalidatePath("/academic/timetable");
  revalidatePath("/student/timetable");
  revalidatePath("/parent/timetable");
  return {};
}
