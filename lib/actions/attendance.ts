"use server";

import { keepRecognizedStudents } from "@/lib/students/recognized";
import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

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
  return {} as { error?: string };
}

export async function markAllPresent(classId: string, date: string, period = 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, status")
    .eq("class_id", classId)
    .in("status", ["active", "pending"]);

  if (studentsError) return { error: studentsError.message };
  const recognized = await keepRecognizedStudents(supabase, students ?? []);
  if (!recognized.length) return await actionError("noStudentsInClass");

  const rows = recognized.map((s) => ({
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
  return {} as { error?: string };
}
