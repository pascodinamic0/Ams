"use server";

import { revalidatePath } from "next/cache";
import { assertBranchAccess, assertClassAccess } from "@/lib/auth/assert";
import { FINANCE_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import {
  feeStructureSchema,
  type FeeStructureFormData,
} from "@/lib/validations/finance";

async function assertFeeStructureAccess(id: string) {
  const supabase = await createClient();
  const { data: feeStructure } = await supabase
    .from("fee_structures")
    .select("branch_id, class_id")
    .eq("id", id)
    .maybeSingle();
  if (!feeStructure) {
    return { ok: false as const, error: "Fee structure not found" };
  }

  const access = await assertBranchAccess(
    feeStructure.branch_id,
    FINANCE_PORTAL_ROLES
  );
  if (!access.ok) return access;

  return { ...access, feeStructure };
}

export async function createFeeStructure(input: FeeStructureFormData) {
  const parsed = feeStructureSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertBranchAccess(
    parsed.data.branch_id,
    FINANCE_PORTAL_ROLES
  );
  if (!access.ok) return { error: access.error };

  if (parsed.data.class_id) {
    const classAccess = await assertClassAccess(
      parsed.data.class_id,
      FINANCE_PORTAL_ROLES
    );
    if (!classAccess.ok) return { error: classAccess.error };
    if (classAccess.branchId !== parsed.data.branch_id) {
      return { error: "Class does not belong to this branch" };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fee_structures")
    .insert({
      name: parsed.data.name,
      branch_id: parsed.data.branch_id,
      amount: parsed.data.amount,
      class_id: parsed.data.class_id || null,
      description: parsed.data.description || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/finance/fee-structure");
  return { data: { id: data.id } };
}

export async function updateFeeStructure(
  id: string,
  updates: Partial<FeeStructureFormData>
) {
  const parsed = feeStructureSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertFeeStructureAccess(id);
  if (!access.ok) return { error: access.error };

  const nextBranchId = parsed.data.branch_id ?? access.feeStructure.branch_id;
  if (parsed.data.branch_id) {
    const nextBranchAccess = await assertBranchAccess(
      parsed.data.branch_id,
      FINANCE_PORTAL_ROLES
    );
    if (!nextBranchAccess.ok) return { error: nextBranchAccess.error };
    if (nextBranchAccess.schoolId !== access.schoolId) {
      return { error: "Cannot move fee structure to another school" };
    }
  }

  const nextClassId =
    parsed.data.class_id === undefined
      ? access.feeStructure.class_id
      : parsed.data.class_id || null;
  if (nextClassId) {
    const classAccess = await assertClassAccess(nextClassId, FINANCE_PORTAL_ROLES);
    if (!classAccess.ok) return { error: classAccess.error };
    if (classAccess.branchId !== nextBranchId) {
      return { error: "Class does not belong to this branch" };
    }
  }

  const supabase = await createClient();
  const payload = {
    ...parsed.data,
    class_id: parsed.data.class_id === "" ? null : parsed.data.class_id,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("fee_structures")
    .update(payload)
    .eq("id", id)
    .eq("branch_id", access.feeStructure.branch_id);

  if (error) return { error: error.message };
  revalidatePath("/finance/fee-structure");
  return {};
}

export async function deleteFeeStructure(id: string) {
  const access = await assertFeeStructureAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fee_structures")
    .delete()
    .eq("id", id)
    .eq("branch_id", access.feeStructure.branch_id);
  if (error) return { error: error.message };
  revalidatePath("/finance/fee-structure");
  return {};
}
