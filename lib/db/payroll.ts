import { createClient } from "@/lib/supabase/server";

export type PayrollListItem = {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string | null;
  branch_name: string | null;
  period_start: string;
  period_end: string;
  amount: number;
  status: string;
};

function mapPayrollRow(row: {
  id: string;
  staff_id: string;
  period_start: string;
  period_end: string;
  amount: number;
  status: string | null;
  staff?: {
    name?: string;
    role?: string | null;
    school_id?: string;
    branch_id?: string | null;
    branches?: { name?: string } | null;
  } | null;
}): PayrollListItem & { school_id?: string; branch_id?: string | null } {
  const staff = row.staff;
  return {
    id: row.id,
    staff_id: row.staff_id,
    staff_name: staff?.name ?? "-",
    staff_role: staff?.role ?? null,
    branch_name: staff?.branches?.name ?? null,
    period_start: row.period_start,
    period_end: row.period_end,
    amount: Number(row.amount),
    status: row.status ?? "pending",
    school_id: staff?.school_id,
    branch_id: staff?.branch_id,
  };
}

export async function getPayroll(options?: {
  schoolId?: string;
  branchId?: string;
  status?: string;
}): Promise<PayrollListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("payroll")
    .select(`
      id,
      staff_id,
      period_start,
      period_end,
      amount,
      status,
      staff(
        name,
        role,
        school_id,
        branch_id,
        branches(name)
      )
    `)
    .order("period_start", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getPayroll error:", error);
    return [];
  }

  let rows = (data ?? []).map((row) =>
    mapPayrollRow(row as Parameters<typeof mapPayrollRow>[0])
  );

  if (options?.schoolId) {
    rows = rows.filter((r) => r.school_id === options.schoolId);
  }
  if (options?.branchId) {
    rows = rows.filter((r) => r.branch_id === options.branchId);
  }

  return rows.map(({ school_id: _s, branch_id: _b, ...item }) => item);
}

export async function getPayrollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payroll")
    .select(`
      *,
      staff(name, role, school_id, branch_id, branches(name))
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getPayrollTotals(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<{ pending: number; paid: number; total: number }> {
  const records = await getPayroll(options);
  let pending = 0;
  let paid = 0;
  for (const record of records) {
    if (record.status === "paid") {
      paid += record.amount;
    } else {
      pending += record.amount;
    }
  }
  return { pending, paid, total: pending + paid };
}

export async function getMonthlyPayrollTotals(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<Record<string, number>> {
  const records = await getPayroll(options);
  const totals: Record<string, number> = {};
  for (const record of records) {
    const month = record.period_start.slice(0, 7);
    totals[month] = (totals[month] ?? 0) + record.amount;
  }
  return totals;
}
