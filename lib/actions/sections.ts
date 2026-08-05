"use server";

import { revalidatePath } from "next/cache";
import { assertBranchAccess } from "@/lib/auth/assert";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { sectionSchema, type SectionFormData } from "@/lib/validations/academic";

export async function createSection(input: SectionFormData) {
  const parsed = sectionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertBranchAccess(
    parsed.data.branch_id,
    ACADEMIC_PORTAL_ROLES
  );
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/academic/sections");
  return { data: { id: data.id } };
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { data: section } = await supabase
    .from("sections")
    .select("branch_id")
    .eq("id", id)
    .maybeSingle();
  if (!section) return { error: "Section not found" };

  const access = await assertBranchAccess(section.branch_id, ACADEMIC_PORTAL_ROLES);
  if (!access.ok) return { error: access.error };

  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/academic/sections");
  return {};
}
