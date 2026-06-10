"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sectionSchema, type SectionFormData } from "@/lib/validations/academic";

export async function createSection(input: SectionFormData) {
  const parsed = sectionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

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
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/academic/sections");
  return {};
}
