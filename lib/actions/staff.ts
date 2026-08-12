"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { staffSchema, type StaffFormData } from "@/lib/validations/operations";

export async function createStaff(input: StaffFormData) {
  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  // Pay amounts are owned by Finance — Operations only adds the person.
  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    branch_id: parsed.data.branch_id || null,
    department: parsed.data.department || null,
    photo_url: parsed.data.photo_url || null,
    monthly_salary: 0,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  revalidatePath("/finance/payroll");
  return { data: { id: data.id } };
}

export async function updateStaff(id: string, input: StaffFormData) {
  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("staff")
    .select("id, monthly_salary")
    .eq("id", id)
    .single();

  if (!existing) return await actionError("staffNotFound");

  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    branch_id: parsed.data.branch_id || null,
    department: parsed.data.department || null,
    photo_url: parsed.data.photo_url || null,
    // Pay amounts are finance-owned for all staff.
    monthly_salary: Number(existing.monthly_salary ?? 0),
  };

  const { error } = await supabase.from("staff").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  revalidatePath("/finance/payroll");
  return {};
}

export async function deleteStaff(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  return {};
}
