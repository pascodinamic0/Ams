"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { classSchema, type ClassFormData } from "@/lib/validations/academic";

export async function createClass(input: ClassFormData) {
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

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

  const supabase = await createClient();
  const { error } = await supabase.from("classes").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/academic/classes");
  return {};
}

export async function deleteClass(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/academic/classes");
  return {};
}
