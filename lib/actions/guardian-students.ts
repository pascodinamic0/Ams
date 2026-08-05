"use server";

import { revalidatePath } from "next/cache";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { canAccessSchool, getAuthedProfile } from "@/lib/auth/assert";
import { createClient } from "@/lib/supabase/server";

export async function linkGuardianToStudent(guardianId: string, studentId: string) {
  const profile = await getAuthedProfile();
  if (!profile) return { error: "Not authenticated" };
  if (
    !ACADEMIC_PORTAL_ROLES.includes(profile.role) &&
    profile.role !== "super_admin"
  ) {
    return { error: "Not authorized" };
  }

  const supabase = await createClient();
  const [{ data: guardian }, { data: student }] = await Promise.all([
    supabase.from("guardians").select("id, school_id").eq("id", guardianId).maybeSingle(),
    supabase.from("students").select("id, school_id").eq("id", studentId).maybeSingle(),
  ]);

  if (!guardian || !student) return { error: "Guardian or student not found" };
  if (guardian.school_id !== student.school_id) {
    return { error: "Guardian and student must belong to the same school" };
  }
  if (!canAccessSchool(profile, student.school_id)) {
    return { error: "Not authorized for this school" };
  }

  const { error } = await supabase.from("guardian_students").insert({
    guardian_id: guardianId,
    student_id: studentId,
  });

  if (error) return { error: error.message };
  revalidatePath("/academic/students");
  revalidatePath(`/academic/students/${studentId}`);
  revalidatePath("/academic/guardians");
  return {};
}
