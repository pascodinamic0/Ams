"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { studentSchema, type StudentFormData } from "@/lib/validations";

async function requireSchoolScopedActor() {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" as const };

  if (profile.role === "super_admin") {
    return { profile, schoolId: null as string | null };
  }

  if (!profile.school_id) {
    return { error: "No school linked to your account" as const };
  }

  return { profile, schoolId: profile.school_id };
}

export async function createStudent(
  input: StudentFormData & { school_id: string; branch_id: string }
) {
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const actor = await requireSchoolScopedActor();
  if ("error" in actor) return { error: actor.error };

  if (actor.schoolId && input.school_id !== actor.schoolId) {
    return { error: "You can only create students for your school" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .insert({
      school_id: input.school_id,
      branch_id: input.branch_id,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      date_of_birth: parsed.data.date_of_birth,
      gender: parsed.data.gender || null,
      class_id: parsed.data.class_id || null,
      status: parsed.data.status,
      home_address: parsed.data.home_address || null,
      notes: parsed.data.notes || null,
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

  const actor = await requireSchoolScopedActor();
  if ("error" in actor) return { error: actor.error };

  const supabase = await createClient();

  let query = supabase.from("students").update(parsed.data).eq("id", id);
  if (actor.schoolId) {
    query = query.eq("school_id", actor.schoolId);
  }

  const { data, error } = await query.select("id").maybeSingle();

  if (error) {
    console.error("updateStudent error:", error);
    return { error: error.message };
  }
  if (!data) {
    return { error: "Student not found in your school" };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  revalidatePath(`/academic/students/${id}`);
  return {};
}

export async function deleteStudent(id: string) {
  const actor = await requireSchoolScopedActor();
  if ("error" in actor) return { error: actor.error };

  const supabase = await createClient();

  let query = supabase.from("students").delete().eq("id", id);
  if (actor.schoolId) {
    query = query.eq("school_id", actor.schoolId);
  }

  const { data, error } = await query.select("id").maybeSingle();

  if (error) {
    console.error("deleteStudent error:", error);
    return { error: error.message };
  }
  if (!data) {
    return { error: "Student not found in your school" };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  return {};
}

export async function deleteStudents(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return { error: "No students selected" };
  }

  const actor = await requireSchoolScopedActor();
  if ("error" in actor) return { error: actor.error };

  const supabase = await createClient();

  let query = supabase.from("students").delete().in("id", uniqueIds);
  if (actor.schoolId) {
    query = query.eq("school_id", actor.schoolId);
  }

  const { data, error } = await query.select("id");

  if (error) {
    console.error("deleteStudents error:", error);
    return { error: error.message };
  }

  const deletedCount = data?.length ?? 0;
  if (deletedCount === 0) {
    return { error: "No matching students found in your school" };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  return { data: { deletedCount } };
}
