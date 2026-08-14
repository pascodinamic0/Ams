"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import {
  studentOnboardingSchema,
  type GuardianOnboardingData,
  type PickupPersonData,
  type StudentOnboardingData,
} from "@/lib/validations/student-onboarding";
import { formatPersonName } from "@/lib/utils";
import {
  assertClassCapacity,
  notifyClassMainTeacher,
} from "@/lib/services/class-enrollment";

async function insertGuardian(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolId: string,
  guardian: GuardianOnboardingData
) {
  const fullName = formatPersonName(guardian);
  const { data, error } = await supabase
    .from("guardians")
    .insert({
      school_id: schoolId,
      name: fullName,
      first_name: guardian.first_name.trim(),
      middle_name: guardian.middle_name?.trim() || null,
      last_name: guardian.last_name.trim(),
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
  studentId: string,
  canPickup: boolean
) {
  const { error } = await supabase.from("guardian_students").insert({
    guardian_id: guardianId,
    student_id: studentId,
    can_pickup: canPickup,
  });
  if (error) return { error: error.message };
  return {} as { error?: string };
}

async function insertPickupPersons(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolId: string,
  studentId: string,
  persons: PickupPersonData[]
) {
  if (persons.length === 0) return {} as { error?: string };

  const { error } = await supabase.from("student_pickup_persons").insert(
    persons.map((person) => ({
      school_id: schoolId,
      student_id: studentId,
      full_name: person.full_name.trim(),
      phone: person.phone.trim(),
      relationship: person.relationship.trim(),
      notes: person.notes?.trim() || null,
    }))
  );

  if (error) return { error: error.message };
  return {} as { error?: string };
}

const STUDENT_ONBOARDING_ROLES = new Set([
  "super_admin",
  "academic_admin",
  "admin_coordinator",
  "registrar",
  "admissions_officer",
  "pedagogy_coordinator",
  "principal",
].filter((role) => ACADEMIC_PORTAL_ROLES.includes(role as typeof ACADEMIC_PORTAL_ROLES[number])));

export async function createStudentWithGuardians(
  input: StudentOnboardingData & {
    school_id: string;
    branch_id: string;
    overrideCapacity?: boolean;
  }
) {
  try {
    const normalized = {
      ...input,
      existing_guardian_id: input.existing_guardian_id || undefined,
      gender: input.gender || undefined,
      pickup_persons: input.pickup_persons ?? [],
    };

    const parsed = studentOnboardingSchema.safeParse(normalized);
    if (!parsed.success) {
      return await zodIssueError(parsed.error.issues[0]?.message);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return await actionError("notAuthenticated");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "";
    if (!STUDENT_ONBOARDING_ROLES.has(role)) {
      return await actionError("noPermissionOnboardStudents");
    }

    const data = parsed.data;

    const capacityCheck = await assertClassCapacity({
      classId: data.class_id,
      override: input.overrideCapacity,
      callerRole: role,
    });
    if ("error" in capacityCheck) return capacityCheck;

    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        school_id: input.school_id,
        branch_id: input.branch_id,
        first_name: data.first_name,
        middle_name: data.middle_name?.trim() || null,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender || null,
        class_id: data.class_id,
        status: data.status,
        home_address: data.home_address || null,
        notes: data.notes || null,
        photo_url: data.photo_url?.trim() || null,
      })
      .select("id, student_id, first_name, middle_name, last_name")
      .single();

    if (studentError) {
      console.error("createStudentWithGuardians student error:", studentError);
      return { error: studentError.message };
    }

    type GuardianLink = { id: string; canPickup: boolean };
    const guardianLinks: GuardianLink[] = [];

    if (data.existing_guardian_id) {
      guardianLinks.push({
        id: data.existing_guardian_id,
        canPickup: Boolean(data.existing_guardian_can_pickup),
      });
    } else if (data.primary_guardian) {
      const result = await insertGuardian(supabase, input.school_id, data.primary_guardian);
      if ("error" in result && result.error) {
        await supabase.from("students").delete().eq("id", student.id);
        return { error: result.error };
      }
      if ("data" in result && result.data) {
        guardianLinks.push({
          id: result.data.id,
          canPickup: Boolean(data.primary_guardian.can_pickup),
        });
      }
    }

    if (data.add_secondary_guardian && data.secondary_guardian) {
      const result = await insertGuardian(supabase, input.school_id, data.secondary_guardian);
      if ("error" in result && result.error) {
        return { error: result.error };
      }
      if ("data" in result && result.data) {
        guardianLinks.push({
          id: result.data.id,
          canPickup: Boolean(data.secondary_guardian.can_pickup),
        });
      }
    }

    for (const link of guardianLinks) {
      const linkResult = await linkGuardian(supabase, link.id, student.id, link.canPickup);
      if (linkResult.error) {
        return { error: linkResult.error };
      }
    }

    const pickupResult = await insertPickupPersons(
      supabase,
      input.school_id,
      student.id,
      data.pickup_persons ?? []
    );
    if (pickupResult.error) {
      return { error: pickupResult.error };
    }

    await notifyClassMainTeacher({
      classId: data.class_id,
      studentId: student.id,
      studentName: formatPersonName(student),
    });

    revalidatePath("/academic");
    revalidatePath("/academic/students");
    revalidatePath(`/academic/students/${student.id}`);
    revalidatePath("/academic/classes");
    revalidatePath("/teacher/classes");

    return { data: { id: student.id, student_id: student.student_id } };
  } catch (err) {
    console.error("createStudentWithGuardians unexpected error:", err);
    return {
      error: err instanceof Error ? err.message : (await actionError("failedOnboardStudent")).error,
    };
  }
}

export async function addGuardianToStudent(
  studentId: string,
  schoolId: string,
  guardian: GuardianOnboardingData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const result = await insertGuardian(supabase, schoolId, guardian);
  if ("error" in result && result.error) {
    return { error: result.error };
  }
  if (!("data" in result) || !result.data) {
    return await actionError("failedCreateGuardian");
  }

  const linkResult = await linkGuardian(
    supabase,
    result.data.id,
    studentId,
    Boolean(guardian.can_pickup)
  );
  if (linkResult.error) return { error: linkResult.error };

  revalidatePath("/academic/students");
  revalidatePath(`/academic/students/${studentId}`);
  return { data: { guardianId: result.data.id } };
}
