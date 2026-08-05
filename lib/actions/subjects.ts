"use server";

import { revalidatePath } from "next/cache";
import { assertBranchAccess } from "@/lib/auth/assert";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { subjectSchema, type SubjectFormData } from "@/lib/validations/academic";

export async function createSubject(input: SubjectFormData) {
  const parsed = subjectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertBranchAccess(
    parsed.data.branch_id,
    ACADEMIC_PORTAL_ROLES
  );
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/academic/subjects");
  return { data: { id: data.id } };
}

export async function deleteSubject(id: string) {
  const supabase = await createClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("branch_id")
    .eq("id", id)
    .maybeSingle();
  if (!subject) return { error: "Subject not found" };

  const access = await assertBranchAccess(subject.branch_id, ACADEMIC_PORTAL_ROLES);
  if (!access.ok) return { error: access.error };

  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/academic/subjects");
  return {};
}
