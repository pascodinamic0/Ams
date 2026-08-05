"use server";

import { revalidatePath } from "next/cache";
import { assertClassAccess, assertTeacherOrAcademic } from "@/lib/auth/assert";
import { createClient } from "@/lib/supabase/server";
import { saveAttendanceSchema } from "@/lib/validations/teacher";

export async function saveAttendance(input: {
  class_id: string;
  date: string;
  period?: number;
  records: { student_id: string; date: string; status: "present" | "absent"; period?: number }[];
}) {
  const parsed = saveAttendanceSchema.safeParse({
    ...input,
    period: input.period ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const role = await assertTeacherOrAcademic();
  if (!role.ok) return { error: role.error };

  const classAccess = await assertClassAccess(parsed.data.class_id);
  if (!classAccess.ok) return { error: classAccess.error };

  const supabase = await createClient();
  const studentIds = parsed.data.records.map((r) => r.student_id);
  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from("students")
      .select("id, class_id, school_id")
      .in("id", studentIds);
    const invalid = (students ?? []).some(
      (s) => s.class_id !== parsed.data.class_id || s.school_id !== classAccess.schoolId
    );
    if (!students || students.length !== studentIds.length || invalid) {
      return { error: "One or more students do not belong to this class" };
    }
  }

  const period = parsed.data.period;
  const rows = parsed.data.records.map((r) => ({
    student_id: r.student_id,
    date: parsed.data.date,
    status: r.status,
    period,
  }));

  const { error } = await supabase
    .from("attendance_records")
    .upsert(rows, { onConflict: "student_id,date,period" });

  if (error) return { error: error.message };

  revalidatePath("/teacher/attendance");
  return {};
}

export async function markAllPresent(classId: string, date: string, period = 0) {
  const role = await assertTeacherOrAcademic();
  if (!role.ok) return { error: role.error };

  const classAccess = await assertClassAccess(classId);
  if (!classAccess.ok) return { error: classAccess.error };

  const supabase = await createClient();
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .eq("status", "active");

  if (studentsError) return { error: studentsError.message };
  if (!students?.length) return { error: "No students in class" };

  const rows = students.map((s) => ({
    student_id: s.id,
    date,
    status: "present" as const,
    period,
  }));

  const { error } = await supabase
    .from("attendance_records")
    .upsert(rows, { onConflict: "student_id,date,period" });

  if (error) return { error: error.message };

  revalidatePath("/teacher/attendance");
  return {};
}
