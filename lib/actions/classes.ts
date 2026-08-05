"use server";

import { revalidatePath } from "next/cache";
import { assertBranchAccess, getBranchSchoolId } from "@/lib/auth/assert";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { classSchema, type ClassFormData } from "@/lib/validations/academic";

async function assertClassRowAccess(id: string) {
  const supabase = await createClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, branch_id")
    .eq("id", id)
    .maybeSingle();
  if (!cls) return { ok: false as const, error: "Class not found" };
  return assertBranchAccess(cls.branch_id, ACADEMIC_PORTAL_ROLES);
}

export async function createClass(input: ClassFormData) {
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertBranchAccess(parsed.data.branch_id, ACADEMIC_PORTAL_ROLES);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: parsed.data.name,
      branch_id: parsed.data.branch_id,
      grade: parsed.data.grade || null,
      section_id: parsed.data.section_id || null,
      capacity: parsed.data.capacity ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/academic/classes");
  return { data: { id: data.id } };
}

export async function updateClass(id: string, updates: Partial<ClassFormData>) {
  const parsed = classSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertClassRowAccess(id);
  if (!access.ok) return { error: access.error };

  if (parsed.data.branch_id) {
    const nextSchool = await getBranchSchoolId(parsed.data.branch_id);
    if (nextSchool !== access.schoolId) {
      return { error: "Cannot move class to another school" };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("classes").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/academic/classes");
  return {};
}

export async function deleteClass(id: string) {
  const access = await assertClassRowAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/academic/classes");
  return {};
}
