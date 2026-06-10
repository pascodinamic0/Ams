"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gradeSchema, upsertGradesSchema, type GradeFormData } from "@/lib/validations/teacher";

export async function upsertGrade(input: GradeFormData) {
  const parsed = gradeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("grades")
    .select("id")
    .eq("student_id", parsed.data.student_id)
    .eq("subject_id", parsed.data.subject_id)
    .eq("class_id", parsed.data.class_id)
    .eq("term", parsed.data.term)
    .maybeSingle();

  const payload = {
    student_id: parsed.data.student_id,
    subject_id: parsed.data.subject_id,
    class_id: parsed.data.class_id,
    term: parsed.data.term,
    marks: parsed.data.marks ?? null,
    grade: parsed.data.grade ?? null,
  };

  if (existing?.id) {
    const { error } = await supabase.from("grades").update(payload).eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("grades").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/teacher/gradebook");
  revalidatePath("/teacher/exams");
  revalidatePath("/teacher/report-cards");
  return {};
}

export async function upsertGrades(input: { grades: GradeFormData[] }) {
  const parsed = upsertGradesSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  for (const grade of parsed.data.grades) {
    const result = await upsertGrade(grade);
    if (result.error) return result;
  }

  return {};
}

export async function deleteGrade(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("grades").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/teacher/gradebook");
  revalidatePath("/teacher/exams");
  return {};
}
