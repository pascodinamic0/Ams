"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/db/staff";
import {
  payrollSchema,
  payrollGenerateSchema,
  type PayrollFormData,
  type PayrollGenerateFormData,
} from "@/lib/validations/finance";

export async function createPayroll(input: PayrollFormData) {
  const parsed = payrollSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("payroll")
    .insert({
      staff_id: parsed.data.staff_id,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      amount: parsed.data.amount,
      status: parsed.data.status ?? "pending",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/finance/payroll");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return { data: { id: data.id } };
}

export async function updatePayroll(id: string, updates: Partial<PayrollFormData>) {
  const parsed = payrollSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payroll")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/finance/payroll");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return {};
}

export async function markPayrollPaid(id: string) {
  return updatePayroll(id, { status: "paid" });
}

export async function deletePayroll(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("payroll").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/finance/payroll");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return {};
}

export async function generatePayroll(
  input: PayrollGenerateFormData & { schoolId?: string; branchId?: string }
) {
  const parsed = payrollGenerateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const staff = await getStaff({
    schoolId: input.schoolId,
    branchId: input.branchId,
  });

  if (staff.length === 0) {
    return { error: "No staff members found for payroll generation" };
  }

  const { data: existing } = await supabase
    .from("payroll")
    .select("staff_id")
    .eq("period_start", parsed.data.period_start)
    .eq("period_end", parsed.data.period_end)
    .in(
      "staff_id",
      staff.map((s) => s.id)
    );

  const existingStaffIds = new Set((existing ?? []).map((r) => r.staff_id));
  const toCreate = staff.filter((s) => !existingStaffIds.has(s.id));

  if (toCreate.length === 0) {
    return { error: "Payroll already exists for all staff in this period" };
  }

  const { error } = await supabase.from("payroll").insert(
    toCreate.map((member) => ({
      staff_id: member.id,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      amount: parsed.data.amount,
      status: "pending" as const,
    }))
  );

  if (error) return { error: error.message };

  revalidatePath("/finance/payroll");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return { data: { created: toCreate.length, skipped: existingStaffIds.size } };
}
