"use server";

import { revalidatePath } from "next/cache";
import {
  assertRoleAndSchool,
  assertSchoolAccess,
  getAuthedProfile,
} from "@/lib/auth/assert";
import { ACADEMIC_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { guardianSchema, type GuardianFormData } from "@/lib/validations";

export async function createGuardian(
  input: GuardianFormData & { school_id: string }
) {
  const parsed = guardianSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const access = await assertRoleAndSchool(ACADEMIC_PORTAL_ROLES, input.school_id);
  if (!access.ok) return { error: access.error };

  const phone = parsed.data.whatsapp || parsed.data.phone || null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guardians")
    .insert({
      school_id: input.school_id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone,
      relation: parsed.data.relation,
      address: parsed.data.address || null,
      workplace: parsed.data.workplace || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createGuardian error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/guardians");
  return { data: { id: data.id } };
}

async function assertGuardianAccess(id: string) {
  const profile = await getAuthedProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated" };
  if (
    profile.role !== "super_admin" &&
    !ACADEMIC_PORTAL_ROLES.includes(profile.role)
  ) {
    return { ok: false as const, error: "Not authorized" };
  }

  const supabase = await createClient();
  const { data: guardian } = await supabase
    .from("guardians")
    .select("id, school_id")
    .eq("id", id)
    .maybeSingle();
  if (!guardian) return { ok: false as const, error: "Guardian not found" };

  const school = await assertSchoolAccess(guardian.school_id);
  if (!school.ok) return school;
  return { ok: true as const, schoolId: guardian.school_id };
}

export async function updateGuardian(
  id: string,
  updates: Partial<GuardianFormData>
) {
  const parsed = guardianSchema.partial().safeParse(updates);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const access = await assertGuardianAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { whatsapp, phone, ...rest } = parsed.data;
  const row = {
    ...rest,
    ...(whatsapp !== undefined || phone !== undefined
      ? { phone: whatsapp ?? phone ?? null }
      : {}),
  };

  const { error } = await supabase
    .from("guardians")
    .update(row)
    .eq("id", id)
    .eq("school_id", access.schoolId!);

  if (error) {
    console.error("updateGuardian error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  revalidatePath("/academic/guardians");
  return {};
}

export async function deleteGuardian(id: string) {
  const access = await assertGuardianAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("guardians")
    .delete()
    .eq("id", id)
    .eq("school_id", access.schoolId!);

  if (error) {
    console.error("deleteGuardian error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/guardians");
  return {};
}
