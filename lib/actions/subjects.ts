"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { subjectSchema, type SubjectFormData } from "@/lib/validations/academic";

export async function createSubject(input: SubjectFormData) {
  const parsed = subjectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

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
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/academic/subjects");
  return {};
}
