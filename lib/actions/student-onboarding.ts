"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  assertRoleAndSchool,
  assertStudentAccess,
  getBranchSchoolId,
} from "@/lib/auth/assert";
import { createClient } from "@/lib/supabase/server";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import {
  studentOnboardingSchema,
  type GuardianOnboardingData,
  type StudentOnboardingData,
} from "@/lib/validations/student-onboarding";

async function insertGuardian(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolId: string,
  guardian: GuardianOnboardingData
) {
  const { data, error } = await supabase
    .from("guardians")
    .insert({
      school_id: schoolId,
      name: guardian.name,
      email: guardian.email,
      phone: guardian.whatsapp || null,
      relation: guardian.relation,
      address: guardian.address || null,
      workplace: guardian.workplace || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { data: { id: data.id } };
}

async function linkGuardian(
  supabase: Awaited<ReturnType<typeof createClient>>,
  guardianId: string,
  studentId: string
) {
  const { error } = await supabase.from("guardian_students").insert({
    guardian_id: guardianId,
    student_id: studentId,
  });
  if (error) return { error: error.message };
  return {};
}

function firstZodIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid form data";
  const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}

const STUDENT_ONBOARDING_ROLE_NAMES = new Set([
  "academic_admin",
  "admin_coordinator",
  "registrar",
  "admissions_officer",
  "pedagogy_coordinator",
  "principal",
]);

const STUDENT_ONBOARDING_ROLES = ACADEMIC_PORTAL_ROLES.filter((role) =>
  STUDENT_ONBOARDING_ROLE_NAMES.has(role)
);

export async function createStudentWithGuardians(
  input: StudentOnboardingData & { school_id: string; branch_id: string }
) {
  try {
    const normalized = {
      ...input,
      existing_guardian_id: input.existing_guardian_id || undefined,
      class_id: input.class_id || undefined,
      gender: input.gender || undefined,
    };

    const parsed = studentOnboardingSchema.safeParse(normalized);
    if (!parsed.success) {
      return { error: firstZodIssueMessage(parsed.error) };
    }

    const access = await assertRoleAndSchool(
      STUDENT_ONBOARDING_ROLES,
      input.school_id
    );
    if (!access.ok) {
      return { error: access.error };
    }

    const branchSchoolId = await getBranchSchoolId(input.branch_id);
    if (!branchSchoolId || branchSchoolId !== input.school_id) {
      return { error: "Branch does not belong to this school" };
    }

    const data = parsed.data;
    const supabase = await createClient();

    if (data.class_id) {
      const { data: cls } = await supabase
        .from("classes")
        .select("branch_id")
        .eq("id", data.class_id)
        .maybeSingle();
      if (!cls || cls.branch_id !== input.branch_id) {
        return { error: "Class does not belong to this branch" };
      }
    }

    if (data.existing_guardian_id) {
      const { data: guardian } = await supabase
        .from("guardians")
        .select("school_id")
        .eq("id", data.existing_guardian_id)
        .maybeSingle();
      if (!guardian || guardian.school_id !== input.school_id) {
        return { error: "Guardian does not belong to this school" };
      }
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        school_id: input.school_id,
        branch_id: input.branch_id,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender || null,
        class_id: data.class_id || null,
        status: data.status,
        home_address: data.home_address || null,
        notes: data.notes || null,
      })
      .select("id, student_id")
      .single();

    if (studentError) {
      console.error("createStudentWithGuardians student error:", studentError);
      return { error: studentError.message };
    }

    const guardianIds: string[] = [];

    if (data.existing_guardian_id) {
      guardianIds.push(data.existing_guardian_id);
    } else if (data.primary_guardian) {
      const result = await insertGuardian(supabase, input.school_id, data.primary_guardian);
      if (result.error) {
        await supabase.from("students").delete().eq("id", student.id);
        return { error: result.error };
      }
      if (result.data) guardianIds.push(result.data.id);
    }

    if (data.add_secondary_guardian && data.secondary_guardian) {
      const result = await insertGuardian(supabase, input.school_id, data.secondary_guardian);
      if (result.error) {
        return { error: result.error };
      }
      if (result.data) guardianIds.push(result.data.id);
    }

    for (const guardianId of guardianIds) {
      const linkResult = await linkGuardian(supabase, guardianId, student.id);
      if (linkResult.error) {
        return { error: linkResult.error };
      }
    }

    revalidatePath("/academic");
    revalidatePath("/academic/students");
    revalidatePath(`/academic/students/${student.id}`);

    return { data: { id: student.id, student_id: student.student_id } };
  } catch (err) {
    console.error("createStudentWithGuardians unexpected error:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to onboard student",
    };
  }
}

export async function addGuardianToStudent(
  studentId: string,
  schoolId: string,
  guardian: GuardianOnboardingData
) {
  const access = await assertStudentAccess(studentId, STUDENT_ONBOARDING_ROLES);
  if (!access.ok) return { error: access.error };
  if (access.schoolId !== schoolId) {
    return { error: "Student does not belong to this school" };
  }

  const supabase = await createClient();

  const result = await insertGuardian(supabase, schoolId, guardian);
  if (result.error || !result.data) return { error: result.error ?? "Failed to create guardian" };

  const linkResult = await linkGuardian(supabase, result.data.id, studentId);
  if (linkResult.error) return { error: linkResult.error };

  revalidatePath("/academic/students");
  revalidatePath(`/academic/students/${studentId}`);
  return { data: { guardianId: result.data.id } };
}
