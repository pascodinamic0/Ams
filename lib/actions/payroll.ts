"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/db/staff";
import {
  payrollGenerateSchema,
  payrollPaymentSchema,
  type PayrollGenerateFormData,
  type PayrollPaymentFormData,
} from "@/lib/validations/finance";

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
    activeOnly: true,
  });

  if (staff.length === 0) {
    return { error: "No active staff members found for payroll generation" };
  }

  const { data: existing } = await supabase
    .from("payroll")
    .select("id")
    .eq("payroll_month", parsed.data.month)
    .eq("payroll_year", parsed.data.year)
    .limit(1);

  if ((existing ?? []).length > 0) {
    return {
      error: `Payroll for ${new Date(
        Date.UTC(parsed.data.year, parsed.data.month - 1, 1)
      ).toLocaleDateString(undefined, { month: "long", year: "numeric" })} has already been generated.`,
    };
  }

  const periodStart = new Date(Date.UTC(parsed.data.year, parsed.data.month - 1, 1));
  const periodEnd = new Date(Date.UTC(parsed.data.year, parsed.data.month, 0));

  const { error } = await supabase.from("payroll").insert(
    staff.map((member) => ({
      staff_id: member.id,
      payroll_month: parsed.data.month,
      payroll_year: parsed.data.year,
      period_start: periodStart.toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
      amount: member.monthly_salary,
      status: "pending" as const,
      payment_date: null,
      payment_method: null,
      reference_number: null,
      notes: null,
      staff_full_name: member.name,
      staff_position: member.role,
      staff_department: member.department,
      staff_monthly_salary: member.monthly_salary,
      staff_employment_status: member.employment_status,
      staff_photo_url: member.photo_url,
    }))
  );

  if (error) return { error: error.message };

  revalidatePath("/finance/payroll");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return { data: { created: staff.length } };
}

export async function markPayrollPaid(
  id: string,
  input: PayrollPaymentFormData
) {
  const parsed = payrollPaymentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not authenticated" };

  const { data: payrollRow, error: payrollError } = await supabase
    .from("payroll")
    .select(
      "id, staff_id, status, payroll_month, payroll_year, staff_full_name, staff_position, staff(name, branch_id)"
    )
    .eq("id", id)
    .single();

  if (payrollError || !payrollRow) return { error: "Payroll record not found" };
  if (payrollRow.status === "paid") {
    return { error: "Payroll has already been marked as paid" };
  }

  const { error } = await supabase
    .from("payroll")
    .update({
      status: "paid",
      amount: parsed.data.amount,
      payment_date: parsed.data.payment_date,
      payment_method: parsed.data.payment_method,
      reference_number: parsed.data.reference_number || null,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const rowStaff = payrollRow.staff as { branch_id?: string | null } | null;
  let branchId = rowStaff?.branch_id ?? null;
  if (!branchId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("branch_id")
      .eq("id", authData.user.id)
      .single();
    branchId = profile?.branch_id ?? null;
  }

  if (branchId) {
    const periodLabel = new Date(
      Date.UTC(payrollRow.payroll_year, payrollRow.payroll_month - 1, 1)
    ).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    await supabase.from("expenses").insert({
      branch_id: branchId,
      category: "Payroll",
      amount: parsed.data.amount,
      date: parsed.data.payment_date,
      description: `Payroll paid: ${payrollRow.staff_full_name} (${payrollRow.staff_position ?? "Staff"}) - ${periodLabel}`,
    });
  }

  revalidatePath("/finance/payroll");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return {};
}

export async function deletePayrollPeriod(input: {
  month: number;
  year: number;
  schoolId?: string;
  branchId?: string;
}) {
  const parsed = payrollGenerateSchema.safeParse({
    month: input.month,
    year: input.year,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payroll")
    .select("id, staff(school_id, branch_id)")
    .eq("payroll_month", parsed.data.month)
    .eq("payroll_year", parsed.data.year);

  if (error) return { error: error.message };

  const toDelete = (data ?? [])
    .filter((row) => {
      const staff = row.staff as { school_id?: string; branch_id?: string | null } | null;
      if (input.schoolId && staff?.school_id !== input.schoolId) return false;
      if (input.branchId && staff?.branch_id !== input.branchId) return false;
      return true;
    })
    .map((row) => row.id);

  if (toDelete.length === 0) return { error: "No payroll records found for this month" };

  const { error: deleteError } = await supabase.from("payroll").delete().in("id", toDelete);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/finance/payroll");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return { data: { deleted: toDelete.length } };
}
