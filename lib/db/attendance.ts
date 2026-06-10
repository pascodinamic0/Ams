import { createClient } from "@/lib/supabase/server";

export type TeacherClassItem = {
  id: string;
  name: string;
  grade: string | null;
  section_name: string | null;
  student_count: number;
};

export type ScheduleSlotItem = {
  id: string;
  period: number;
  class_id: string;
  class_name: string;
  subject_name: string | null;
};

export type AttendanceRecordItem = {
  id: string | null;
  student_id: string;
  student_name: string;
  student_number: string | null;
  status: "present" | "absent";
};

export async function getTeacherClasses(teacherId: string): Promise<TeacherClassItem[]> {
  const supabase = await createClient();

  const { data: slots, error: slotsError } = await supabase
    .from("timetable_slots")
    .select("class_id")
    .eq("teacher_id", teacherId);

  if (slotsError) {
    console.error("getTeacherClasses slots error:", slotsError);
    return [];
  }

  const classIds = [...new Set((slots ?? []).map((s) => s.class_id))];
  if (classIds.length === 0) return [];

  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("id, name, grade, sections(name)")
    .in("id", classIds)
    .order("name");

  if (classesError) {
    console.error("getTeacherClasses classes error:", classesError);
    return [];
  }

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, class_id")
    .in("class_id", classIds)
    .eq("status", "active");

  if (studentsError) {
    console.error("getTeacherClasses students error:", studentsError);
  }

  const countByClass: Record<string, number> = {};
  for (const s of students ?? []) {
    if (s.class_id) countByClass[s.class_id] = (countByClass[s.class_id] ?? 0) + 1;
  }

  return (classes ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    section_name: (c.sections as { name?: string } | null)?.name ?? null,
    student_count: countByClass[c.id] ?? 0,
  }));
}

export async function getTeacherTodaySchedule(teacherId: string): Promise<ScheduleSlotItem[]> {
  const supabase = await createClient();
  const dayOfWeek = new Date().getDay();

  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id, period, class_id, classes(name), subjects(name)")
    .eq("teacher_id", teacherId)
    .eq("day", dayOfWeek)
    .order("period");

  if (error) {
    console.error("getTeacherTodaySchedule error:", error);
    return [];
  }

  return (data ?? []).map((slot) => ({
    id: slot.id,
    period: slot.period,
    class_id: slot.class_id,
    class_name: (slot.classes as { name?: string } | null)?.name ?? "Class",
    subject_name: (slot.subjects as { name?: string } | null)?.name ?? null,
  }));
}

export async function getAttendanceForClass(
  classId: string,
  date: string,
  period = 0
): Promise<AttendanceRecordItem[]> {
  const supabase = await createClient();

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, first_name, last_name, student_id")
    .eq("class_id", classId)
    .eq("status", "active")
    .order("last_name");

  if (studentsError) {
    console.error("getAttendanceForClass students error:", studentsError);
    return [];
  }

  const { data: records, error: recordsError } = await supabase
    .from("attendance_records")
    .select("id, student_id, status")
    .eq("date", date)
    .eq("period", period)
    .in("student_id", (students ?? []).map((s) => s.id));

  if (recordsError) {
    console.error("getAttendanceForClass records error:", recordsError);
  }

  const recordMap = new Map(
    (records ?? []).map((r) => [r.student_id, { id: r.id, status: r.status as "present" | "absent" }])
  );

  return (students ?? []).map((s) => {
    const existing = recordMap.get(s.id);
    return {
      id: existing?.id ?? null,
      student_id: s.id,
      student_name: `${s.first_name} ${s.last_name}`,
      student_number: s.student_id,
      status: existing?.status ?? "present",
    };
  });
}

export async function getStudentAttendanceStats(
  studentId: string,
  startDate?: string,
  endDate?: string
): Promise<{ present: number; absent: number; total: number; percentage: number }> {
  const supabase = await createClient();
  let query = supabase
    .from("attendance_records")
    .select("status")
    .eq("student_id", studentId);

  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);

  const { data, error } = await query;
  if (error) {
    console.error("getStudentAttendanceStats error:", error);
    return { present: 0, absent: 0, total: 0, percentage: 0 };
  }

  const present = (data ?? []).filter((r) => r.status === "present").length;
  const absent = (data ?? []).filter((r) => r.status === "absent").length;
  const total = present + absent;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return { present, absent, total, percentage };
}
