"use server";

import { revalidatePath } from "next/cache";
import { assertClassAccess } from "@/lib/auth/assert";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { gradeSchema, upsertGradesSchema, type GradeFormData } from "@/lib/validations/teacher";

const GRADE_MANAGE_ROLES = [...ACADEMIC_PORTAL_ROLES, "teacher"] as const;

async function assertGradeInputAccess(input: GradeFormData) {
  const classAccess = await assertClassAccess(input.class_id, GRADE_MANAGE_ROLES);
  if (!classAccess.ok) return classAccess;

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("school_id, class_id")
    .eq("id", input.student_id)
    .maybeSingle();
  if (!student) {
    return { ok: false as const, error: "Student not found" };
  }
  if (student.school_id !== classAccess.schoolId) {
    return { ok: false as const, error: "Student does not belong to this school" };
  }
  if (student.class_id && student.class_id !== input.class_id) {
    return { ok: false as const, error: "Student does not belong to this class" };
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("branch_id")
    .eq("id", input.subject_id)
    .maybeSingle();
  if (!subject) {
    return { ok: false as const, error: "Subject not found" };
  }
  if (subject.branch_id !== classAccess.branchId) {
    return { ok: false as const, error: "Subject does not belong to this class branch" };
  }

  return classAccess;
}

export async function upsertGrade(input: GradeFormData) {
  const parsed = gradeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertGradeInputAccess(parsed.data);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();

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
  const { data: grade } = await supabase
    .from("grades")
    .select("class_id")
    .eq("id", id)
    .maybeSingle();
  if (!grade) return { error: "Grade not found" };

  const access = await assertClassAccess(grade.class_id, GRADE_MANAGE_ROLES);
  if (!access.ok) return { error: access.error };

  const { error } = await supabase.from("grades").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/teacher/gradebook");
  revalidatePath("/teacher/exams");
  return {};
}
