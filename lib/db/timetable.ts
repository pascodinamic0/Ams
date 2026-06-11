import { createClient } from "@/lib/supabase/server";
import type { TimetableCellEntry, TimetableSlot, TeacherOption } from "@/lib/timetable/shared";

export type { TimetableSlot, TimetableSlotItem, TeacherOption } from "@/lib/timetable/shared";
export { TIMETABLE_DAYS, TIMETABLE_PERIODS, DAY_LABELS } from "@/lib/timetable/shared";

function normalizeTime(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

function mapSlotRows(data: unknown[]): TimetableSlot[] {
  return data.map((row) => {
    const r = row as {
      id: string;
      class_id: string;
      day: number;
      period: number;
      subject_id: string | null;
      teacher_id: string | null;
      start_time: string | null;
      end_time: string | null;
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
      start_time: normalizeTime(r.start_time),
      end_time: normalizeTime(r.end_time),
    };
  });
}

const SLOT_SELECT =
  "id, class_id, day, period, subject_id, teacher_id, start_time, end_time, subjects(name), profiles(name)";

export async function getTimetableSlots(classId: string): Promise<TimetableSlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timetable_slots")
    .select(SLOT_SELECT)
    .eq("class_id", classId)
    .order("day")
    .order("period")
    .order("start_time", { nullsFirst: false });

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
    list.sort((a, b) => {
      if (a.period !== b.period) return a.period - b.period;
      const aStart = a.start_time ?? "";
      const bStart = b.start_time ?? "";
      return aStart.localeCompare(bStart);
    });
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
  start_time?: string | null;
  end_time?: string | null;
};

function timesOverlap(
  aStart: string | null,
  aEnd: string | null,
  bStart: string | null,
  bEnd: string | null
): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart < bEnd && bStart < aEnd;
}

export async function findTeacherTimetableConflict(
  teacherId: string,
  day: number,
  period: number,
  excludeClassId: string,
  startTime?: string | null,
  endTime?: string | null,
  excludeSlotId?: string
): Promise<{ id: string; class_name: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id, period, start_time, end_time, classes(name)")
    .eq("teacher_id", teacherId)
    .eq("day", day)
    .neq("class_id", excludeClassId);

  if (error) {
    console.error("findTeacherTimetableConflict error:", error);
    return null;
  }

  const normalizedStart = normalizeTime(startTime);
  const normalizedEnd = normalizeTime(endTime);

  for (const row of data ?? []) {
    if (excludeSlotId && row.id === excludeSlotId) continue;

    const rowStart = normalizeTime(row.start_time);
    const rowEnd = normalizeTime(row.end_time);

    const conflicts =
      normalizedStart && normalizedEnd && rowStart && rowEnd
        ? timesOverlap(normalizedStart, normalizedEnd, rowStart, rowEnd)
        : row.period === period;

    if (conflicts) {
      return {
        id: row.id,
        class_name: (row.classes as { name?: string } | null)?.name ?? null,
      };
    }
  }

  return null;
}

export async function deleteTimetableSlotsForCell(
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
    console.error("deleteTimetableSlotsForCell error:", error);
    return { error: error.message };
  }

  return {};
}

export async function insertTimetableSlot(
  payload: TimetableSlotWrite
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timetable_slots")
    .insert({
      class_id: payload.class_id,
      day: payload.day,
      period: payload.period,
      subject_id: payload.subject_id,
      teacher_id: payload.teacher_id,
      start_time: normalizeTime(payload.start_time),
      end_time: normalizeTime(payload.end_time),
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

export async function replaceTimetableCell(
  classId: string,
  day: number,
  period: number,
  entries: TimetableCellEntry[]
): Promise<{ error?: string }> {
  const activeEntries = entries.filter((e) => e.subject_id || e.teacher_id);

  const clearResult = await deleteTimetableSlotsForCell(classId, day, period);
  if (clearResult.error) return clearResult;

  for (const entry of activeEntries) {
    const result = await insertTimetableSlot({
      class_id: classId,
      day,
      period,
      subject_id: entry.subject_id,
      teacher_id: entry.teacher_id,
      start_time: entry.start_time,
      end_time: entry.end_time,
    });
    if ("error" in result) return { error: result.error };
  }

  return {};
}

/** @deprecated Use replaceTimetableCell for multi-subject cells */
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
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("findTimetableSlot error:", error);
    return null;
  }

  return data;
}

/** @deprecated Use deleteTimetableSlotsForCell */
export async function deleteTimetableSlot(
  classId: string,
  day: number,
  period: number
): Promise<{ error?: string }> {
  return deleteTimetableSlotsForCell(classId, day, period);
}

/** @deprecated Use replaceTimetableCell */
export async function updateTimetableSlot(
  id: string,
  payload: TimetableSlotWrite
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timetable_slots")
    .update({
      class_id: payload.class_id,
      day: payload.day,
      period: payload.period,
      subject_id: payload.subject_id,
      teacher_id: payload.teacher_id,
      start_time: normalizeTime(payload.start_time),
      end_time: normalizeTime(payload.end_time),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("updateTimetableSlot error:", error);
    return { error: error.message };
  }

  return {};
}

/** @deprecated Use replaceTimetableCell */
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
