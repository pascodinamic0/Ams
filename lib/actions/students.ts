"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { studentSchema, type StudentFormData } from "@/lib/validations";

export async function createStudent(
  input: StudentFormData & { school_id: string; branch_id: string }
) {
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("students")
    .insert({
      school_id: input.school_id,
      branch_id: input.branch_id,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      date_of_birth: parsed.data.date_of_birth,
      class_id: parsed.data.class_id || null,
      status: parsed.data.status,
    })
    .select("id, student_id")
    .single();

  if (error) {
    console.error("createStudent error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  return { data: { id: data.id, student_id: data.student_id } };
}

export async function updateStudent(
  id: string,
  updates: Partial<StudentFormData>
) {
  const parsed = studentSchema.partial().safeParse(updates);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("students")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    console.error("updateStudent error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  revalidatePath(`/academic/students/${id}`);
  return {};
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("students").delete().eq("id", id);

  if (error) {
    console.error("deleteStudent error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  return {};
}
