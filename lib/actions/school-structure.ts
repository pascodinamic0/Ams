"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  schoolStructureSchema,
  type SchoolStructureInput,
} from "@/lib/validations/school-structure";

async function requireStructureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) return await actionError("noSchoolLinkedShort");
  if (profile.role !== "academic_admin") {
    return await actionError("onlyAdminsStructure");
  }

  const { data: school } = await supabase
    .from("schools")
    .select("id, status, structure_setup_completed_at")
    .eq("id", profile.school_id)
    .single();

  if (!school) return await actionError("schoolNotFound");
  if (school.status !== "approved") {
    return await actionError("schoolMustBeApprovedStructure");
  }

  let branchId = profile.branch_id;
  if (!branchId) {
    const { data: branch } = await supabase
      .from("branches")
      .select("id")
      .eq("school_id", profile.school_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    branchId = branch?.id ?? null;
  }

  if (!branchId) return await actionError("noCampusFound");

  return { supabase, user, profile, school, branchId };
}

export async function createSchoolStructure(input: SchoolStructureInput) {
  const parsed = schoolStructureSchema.safeParse(input);
  if (!parsed.success) {
    return await zodIssueError(parsed.error.issues[0]?.message);
  }

  const auth = await requireStructureAdmin();
  if ("error" in auth) return auth;

  const { grades, school_level } = parsed.data;
  const uniqueGrades = [...new Set(grades.map((g) => g.trim()).filter(Boolean))];

  if (uniqueGrades.length === 0) {
    return await zodIssueError("selectAtLeastOneGrade");
  }

  const { data: existingClasses } = await auth.supabase
    .from("classes")
    .select("name")
    .eq("branch_id", auth.branchId);

  const existingNames = new Set((existingClasses ?? []).map((c) => c.name));

  const classRows = uniqueGrades
    .filter((grade) => !existingNames.has(grade))
    .map((grade) => ({
      name: grade,
      branch_id: auth.branchId,
      grade,
    }));

  if (classRows.length > 0) {
    const { error: classError } = await auth.supabase
      .from("classes")
      .insert(classRows);

    if (classError) return { error: classError.message };
  }

  const { error: schoolError } = await auth.supabase
    .from("schools")
    .update({
      school_level,
      structure_setup_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.profile.school_id);

  if (schoolError) return { error: schoolError.message };

  revalidatePath("/onboarding/school");
  revalidatePath("/academic");
  revalidatePath("/academic/classes");
  revalidatePath("/", "layout");

  return {
    data: {
      createdCount: classRows.length,
      destination: "/academic",
    },
  };
}

export async function skipSchoolStructureSetup() {
  const auth = await requireStructureAdmin();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase
    .from("schools")
    .update({
      structure_setup_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.profile.school_id);

  if (error) return { error: error.message };

  revalidatePath("/onboarding/school");
  revalidatePath("/academic");
  revalidatePath("/", "layout");

  return { data: { destination: "/academic" } };
}
