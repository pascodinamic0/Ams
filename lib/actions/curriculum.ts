"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  deleteCurriculum as deleteCurriculumDb,
  insertCurriculum,
  updateCurriculum as updateCurriculumDb,
} from "@/lib/db/curriculum";
import { curriculumSchema, type CurriculumFormData } from "@/lib/validations/academic";

export async function createCurriculum(input: CurriculumFormData) {
  const parsed = curriculumSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const result = await updateCurriculumDb(id, {
    ...parsed.data,
    syllabus: parsed.data.syllabus ?? undefined,
  });

  if (result.error) return { error: result.error };

  revalidatePath("/academic/curriculum");
  return {};
}

export async function deleteCurriculum(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const result = await deleteCurriculumDb(id);
  if (result.error) return { error: result.error };

  revalidatePath("/academic/curriculum");
  return {};
}
