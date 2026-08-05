"use server";

import { revalidatePath } from "next/cache";
import { assertBranchAccess } from "@/lib/auth/assert";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import {
  deleteCurriculum as deleteCurriculumDb,
  insertCurriculum,
  updateCurriculum as updateCurriculumDb,
} from "@/lib/db/curriculum";
import { curriculumSchema, type CurriculumFormData } from "@/lib/validations/academic";

async function assertCurriculumAccess(id: string) {
  const supabase = await createClient();
  const { data: curriculum } = await supabase
    .from("curriculum")
    .select("branch_id")
    .eq("id", id)
    .maybeSingle();
  if (!curriculum) return { ok: false as const, error: "Curriculum not found" };

  const access = await assertBranchAccess(
    curriculum.branch_id,
    ACADEMIC_PORTAL_ROLES
  );
  if (!access.ok) return access;
  return { ...access, branchId: curriculum.branch_id };
}

async function assertSubjectBelongsToBranch(subjectId: string, branchId: string) {
  const supabase = await createClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("branch_id")
    .eq("id", subjectId)
    .maybeSingle();
  if (!subject) return "Subject not found";
  if (subject.branch_id !== branchId) return "Subject does not belong to this branch";
  return null;
}

export async function createCurriculum(input: CurriculumFormData) {
  const parsed = curriculumSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertBranchAccess(
    parsed.data.branch_id,
    ACADEMIC_PORTAL_ROLES
  );
  if (!access.ok) return { error: access.error };

  const subjectError = await assertSubjectBelongsToBranch(
    parsed.data.subject_id,
    parsed.data.branch_id
  );
  if (subjectError) return { error: subjectError };

  const result = await insertCurriculum({
    branch_id: parsed.data.branch_id,
    grade: parsed.data.grade,
    subject_id: parsed.data.subject_id,
    syllabus: parsed.data.syllabus ?? null,
  });

  if ("error" in result) return { error: result.error };

  revalidatePath("/academic/curriculum");
  return { data: { id: result.id } };
}

export async function updateCurriculum(id: string, updates: Partial<CurriculumFormData>) {
  const parsed = curriculumSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertCurriculumAccess(id);
  if (!access.ok) return { error: access.error };

  const nextBranchId = parsed.data.branch_id ?? access.branchId;
  if (parsed.data.branch_id) {
    const nextAccess = await assertBranchAccess(
      parsed.data.branch_id,
      ACADEMIC_PORTAL_ROLES
    );
    if (!nextAccess.ok) return { error: nextAccess.error };
    if (nextAccess.schoolId !== access.schoolId) {
      return { error: "Cannot move curriculum to another school" };
    }
  }

  if (parsed.data.subject_id) {
    const subjectError = await assertSubjectBelongsToBranch(
      parsed.data.subject_id,
      nextBranchId
    );
    if (subjectError) return { error: subjectError };
  }

  const result = await updateCurriculumDb(id, {
    ...parsed.data,
    syllabus: parsed.data.syllabus ?? undefined,
  });

  if (result.error) return { error: result.error };

  revalidatePath("/academic/curriculum");
  return {};
}

export async function deleteCurriculum(id: string) {
  const access = await assertCurriculumAccess(id);
  if (!access.ok) return { error: access.error };

  const result = await deleteCurriculumDb(id);
  if (result.error) return { error: result.error };

  revalidatePath("/academic/curriculum");
  return {};
}
