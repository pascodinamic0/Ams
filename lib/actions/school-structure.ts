"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildClassName } from "@/lib/schools/structure-presets";
import {
  schoolStructureSchema,
  type SchoolStructureInput,
} from "@/lib/validations/school-structure";

async function requireStructureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) return { error: "No school linked to your account" as const };
  if (profile.role !== "academic_admin") {
    return { error: "Only school administrators can set up structure" as const };
  }

  const { data: school } = await supabase
    .from("schools")
    .select("id, status, structure_setup_completed_at")
    .eq("id", profile.school_id)
    .single();

  if (!school) return { error: "School not found" as const };
  if (school.status !== "approved") {
    return { error: "School must be approved before structure setup" as const };
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

  if (!branchId) return { error: "No campus/branch found for this school" as const };

  return { supabase, user, profile, school, branchId };
}

export async function createSchoolStructure(input: SchoolStructureInput) {
  const parsed = schoolStructureSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid structure selection",
    };
  }

  const auth = await requireStructureAdmin();
  if ("error" in auth) return auth;

  const { grades, sections, school_level } = parsed.data;
  const uniqueGrades = [...new Set(grades.map((g) => g.trim()).filter(Boolean))];
  const uniqueSections = [...new Set(sections)];

  if (uniqueGrades.length === 0) {
    return { error: "Select at least one grade" };
  }

  const { data: existingSections } = await auth.supabase
    .from("sections")
    .select("id, name")
    .eq("branch_id", auth.branchId)
    .in("name", uniqueSections);

  const sectionIdByName = new Map(
    (existingSections ?? []).map((s) => [s.name, s.id] as const)
  );

  for (const letter of uniqueSections) {
    if (sectionIdByName.has(letter)) continue;

    const { data: created, error } = await auth.supabase
      .from("sections")
      .insert({ name: letter, branch_id: auth.branchId })
      .select("id, name")
      .single();

    if (error) return { error: error.message };
    sectionIdByName.set(created.name, created.id);
  }

  const { data: existingClasses } = await auth.supabase
    .from("classes")
    .select("name")
    .eq("branch_id", auth.branchId);

  const existingNames = new Set((existingClasses ?? []).map((c) => c.name));

  const classRows: {
    name: string;
    branch_id: string;
    grade: string;
    section_id: string;
  }[] = [];

  for (const grade of uniqueGrades) {
    for (const letter of uniqueSections) {
      const sectionId = sectionIdByName.get(letter);
      if (!sectionId) continue;

      const name = buildClassName(grade, letter);
      if (existingNames.has(name)) continue;

      classRows.push({
        name,
        branch_id: auth.branchId,
        grade,
        section_id: sectionId,
      });
    }
  }

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
  revalidatePath("/academic/sections");
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
