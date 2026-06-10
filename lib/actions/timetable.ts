"use server";

import { revalidatePath } from "next/cache";
import {
  deleteTimetableSlot,
  findTeacherTimetableConflict,
  upsertTimetableSlot as upsertTimetableSlotDb,
} from "@/lib/db/timetable";
import { timetableSlotSchema, type TimetableSlotFormData } from "@/lib/validations/academic";

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
  const result = await deleteTimetableSlot(classId, day, period);
  if (result.error) return { error: result.error };

  revalidatePath("/academic/timetable");
  return {};
}
