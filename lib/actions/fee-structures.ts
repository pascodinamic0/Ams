"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  feeStructureSchema,
  type FeeStructureFormData,
} from "@/lib/validations/finance";

export async function createFeeStructure(input: FeeStructureFormData) {
  const parsed = feeStructureSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

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

  const supabase = await createClient();
  const payload = {
    ...parsed.data,
    class_id: parsed.data.class_id === "" ? null : parsed.data.class_id,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("fee_structures")
    .update(payload)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/finance/fee-structure");
  return {};
}

export async function deleteFeeStructure(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("fee_structures").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/finance/fee-structure");
  return {};
}
