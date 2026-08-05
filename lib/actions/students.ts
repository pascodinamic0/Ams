"use server";

import { revalidatePath } from "next/cache";
import {
  assertRoleAndSchool,
  assertStudentAccess,
  getBranchSchoolId,
} from "@/lib/auth/assert";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { studentSchema, type StudentFormData } from "@/lib/validations";

export async function createStudent(
  input: StudentFormData & { school_id: string; branch_id: string }
) {
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const schoolCheck = await assertRoleAndSchool(
    ACADEMIC_PORTAL_ROLES,
    input.school_id
  );
  if (!schoolCheck.ok) return { error: schoolCheck.error };

  const branchSchoolId = await getBranchSchoolId(input.branch_id);
  if (!branchSchoolId || branchSchoolId !== input.school_id) {
    return { error: "Branch does not belong to this school" };
  }

  if (parsed.data.class_id) {
    const supabase = await createClient();
    const { data: cls } = await supabase
      .from("classes")
      .select("id, branch_id")
      .eq("id", parsed.data.class_id)
      .maybeSingle();
    if (!cls || cls.branch_id !== input.branch_id) {
      return { error: "Class does not belong to this branch" };
    }
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

  const access = await assertStudentAccess(id, ACADEMIC_PORTAL_ROLES);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update(parsed.data)
    .eq("id", id)
    .eq("school_id", access.schoolId!);

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
  const access = await assertStudentAccess(id, ACADEMIC_PORTAL_ROLES);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id)
    .eq("school_id", access.schoolId!);

  if (error) {
    console.error("deleteStudent error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  return {};
}
