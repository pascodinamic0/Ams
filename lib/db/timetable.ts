import { createClient } from "@/lib/supabase/server";
import type { TimetableSlot, TeacherOption } from "@/lib/timetable/shared";

export type { TimetableSlot, TimetableSlotItem, TeacherOption } from "@/lib/timetable/shared";
export { TIMETABLE_DAYS, TIMETABLE_PERIODS, DAY_LABELS } from "@/lib/timetable/shared";

function mapSlotRows(data: unknown[]): TimetableSlot[] {
  return data.map((row) => {
    const r = row as {
      id: string;
      class_id: string;
      day: number;
      period: number;
      subject_id: string | null;
      teacher_id: string | null;
      subjects: { name?: string } | null;
      profiles: { name?: string } | null;
    };
    return {
      id: r.id,
      class_id: r.class_id,
      day: r.day,
      period: r.period,
      subject_id: r.subject_id,
      subject_name: r.subjects?.name ?? null,
      teacher_id: r.teacher_id,
      teacher_name: r.profiles?.name ?? null,
    };
  });
}

export async function getTimetableSlots(classId: string): Promise<TimetableSlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id, class_id, day, period, subject_id, teacher_id, subjects(name), profiles(name)")
    .eq("class_id", classId)
    .order("day")
    .order("period");

  if (error) {
    console.error("getTimetableSlots error:", error);
    return [];
  }

  return mapSlotRows(data ?? []);
}

export async function getTimetableForClass(classId: string): Promise<TimetableSlot[]> {
  return getTimetableSlots(classId);
}

export async function getTodaysTimetableForClass(classId: string): Promise<TimetableSlot[]> {
  const dayOfWeek = new Date().getDay();
  const slots = await getTimetableSlots(classId);
  return slots.filter((s) => s.day === dayOfWeek);
}

export function groupTimetableByDay(slots: TimetableSlot[]): Map<number, TimetableSlot[]> {
  const byDay = new Map<number, TimetableSlot[]>();
  for (const slot of slots) {
    const list = byDay.get(slot.day) ?? [];
    list.push(slot);
    byDay.set(slot.day, list);
  }
  for (const [, list] of byDay) {
    list.sort((a, b) => a.period - b.period);
  }
  return byDay;
}

export async function getTeachers(schoolId: string): Promise<TeacherOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("school_id", schoolId)
    .in("role", ["teacher", "academic_admin"])
    .order("name");

  if (error) {
    console.error("getTeachers error:", error);
    return [];
  }

  return (data ?? []).map((t) => ({ id: t.id, name: t.name }));
}

export type TimetableSlotWrite = {
  class_id: string;
  day: number;
  period: number;
  subject_id: string | null;
  teacher_id: string | null;
};

export async function findTimetableSlot(
  classId: string,
  day: number,
  period: number
): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id")
    .eq("class_id", classId)
    .eq("day", day)
    .eq("period", period)
    .maybeSingle();

  if (error) {
    console.error("findTimetableSlot error:", error);
    return null;
  }

  return data;
}

export async function findTeacherTimetableConflict(
  teacherId: string,
  day: number,
  period: number,
  excludeClassId: string
): Promise<{ id: string; class_name: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id, classes(name)")
    .eq("teacher_id", teacherId)
    .eq("day", day)
    .eq("period", period)
    .neq("class_id", excludeClassId)
    .maybeSingle();

  if (error) {
    console.error("findTeacherTimetableConflict error:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    class_name: (data.classes as { name?: string } | null)?.name ?? null,
  };
}

export async function insertTimetableSlot(
  payload: TimetableSlotWrite
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timetable_slots")
    .insert({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("insertTimetableSlot error:", error);
    return { error: error.message };
  }

  return { id: data.id };
}

export async function updateTimetableSlot(
  id: string,
  payload: TimetableSlotWrite
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timetable_slots")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("updateTimetableSlot error:", error);
    return { error: error.message };
  }

  return {};
}

export async function deleteTimetableSlot(
  classId: string,
  day: number,
  period: number
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timetable_slots")
    .delete()
    .eq("class_id", classId)
    .eq("day", day)
    .eq("period", period);

  if (error) {
    console.error("deleteTimetableSlot error:", error);
    return { error: error.message };
  }

  return {};
}

export async function upsertTimetableSlot(
  payload: TimetableSlotWrite
): Promise<{ id: string } | { error: string }> {
  const existing = await findTimetableSlot(payload.class_id, payload.day, payload.period);
  if (existing) {
    const result = await updateTimetableSlot(existing.id, payload);
    if (result.error) return { error: result.error };
    return { id: existing.id };
  }

  return insertTimetableSlot(payload);
}
