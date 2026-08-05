"use server";

import { revalidatePath } from "next/cache";
import { assertRoleAndSchool, getBranchSchoolId } from "@/lib/auth/assert";
import { OPERATIONS_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { staffSchema, type StaffFormData } from "@/lib/validations/operations";

async function assertStaffBranchMatchesSchool(
  branchId: string | null | undefined,
  schoolId: string
) {
  if (!branchId) return null;
  const branchSchoolId = await getBranchSchoolId(branchId);
  if (!branchSchoolId) return "Branch not found";
  if (branchSchoolId !== schoolId) return "Branch does not belong to this school";
  return null;
}

async function assertStaffAccess(id: string) {
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("staff")
    .select("school_id")
    .eq("id", id)
    .maybeSingle();
  if (!staff) return { ok: false as const, error: "Staff member not found" };

  const access = await assertRoleAndSchool(
    OPERATIONS_PORTAL_ROLES,
    staff.school_id
  );
  if (!access.ok) return access;
  return { ...access, schoolId: staff.school_id };
}

export async function createStaff(input: StaffFormData) {
  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertRoleAndSchool(
    OPERATIONS_PORTAL_ROLES,
    parsed.data.school_id
  );
  if (!access.ok) return { error: access.error };

  const branchError = await assertStaffBranchMatchesSchool(
    parsed.data.branch_id,
    parsed.data.school_id
  );
  if (branchError) return { error: branchError };

  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    branch_id: parsed.data.branch_id || null,
    department: parsed.data.department || null,
    photo_url: parsed.data.photo_url || null,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  return { data: { id: data.id } };
}

export async function updateStaff(id: string, input: StaffFormData) {
  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertStaffAccess(id);
  if (!access.ok) return { error: access.error };

  if (parsed.data.school_id !== access.schoolId) {
    return { error: "Cannot move staff to another school" };
  }

  const branchError = await assertStaffBranchMatchesSchool(
    parsed.data.branch_id,
    parsed.data.school_id
  );
  if (branchError) return { error: branchError };

  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    branch_id: parsed.data.branch_id || null,
    department: parsed.data.department || null,
    photo_url: parsed.data.photo_url || null,
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff")
    .update(payload)
    .eq("id", id)
    .eq("school_id", access.schoolId);
  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  return {};
}

export async function deleteStaff(id: string) {
  const access = await assertStaffAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff")
    .delete()
    .eq("id", id)
    .eq("school_id", access.schoolId);
  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  return {};
}
