import { createClient } from "@/lib/supabase/server";

export type PayrollListItem = {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_position: string | null;
  staff_department: string | null;
  staff_photo_url: string | null;
  payroll_month: number;
  payroll_year: number;
  period_start: string;
  period_end: string;
  amount: number;
  status: "pending" | "paid";
  payment_date: string | null;
  payment_method: "cash" | "bank" | "mobile_money" | null;
  reference_number: string | null;
  notes: string | null;
  staff_employment_status: "active" | "inactive";
  branch_name: string | null;
};

function mapPayrollRow(row: {
  id: string;
  staff_id: string;
  payroll_month?: number | null;
  payroll_year?: number | null;
  period_start: string;
  period_end: string;
  amount: number;
  status: string | null;
  payment_date?: string | null;
  payment_method?: "cash" | "bank" | "mobile_money" | null;
  reference_number?: string | null;
  notes?: string | null;
  staff_full_name?: string | null;
  staff_position?: string | null;
  staff_department?: string | null;
  staff_photo_url?: string | null;
  staff_employment_status?: "active" | "inactive" | null;
  staff_monthly_salary?: number | null;
  staff?: {
    name?: string;
    role?: string | null;
    department?: string | null;
    employment_status?: "active" | "inactive" | null;
    photo_url?: string | null;
    school_id?: string;
    branch_id?: string | null;
    branches?: { name?: string } | null;
  } | null;
}): PayrollListItem & {
  school_id?: string;
  branch_id?: string | null;
  staff_monthly_salary: number;
} {
  const staff = row.staff;
  const periodStart = row.period_start;
  const fallbackYear = Number(periodStart.slice(0, 4));
  const fallbackMonth = Number(periodStart.slice(5, 7));
  return {
    id: row.id,
    staff_id: row.staff_id,
    staff_name: row.staff_full_name ?? staff?.name ?? "-",
    staff_position: row.staff_position ?? staff?.role ?? null,
    staff_department: row.staff_department ?? staff?.department ?? null,
    staff_photo_url: row.staff_photo_url ?? staff?.photo_url ?? null,
    payroll_month: row.payroll_month ?? fallbackMonth,
    payroll_year: row.payroll_year ?? fallbackYear,
    branch_name: staff?.branches?.name ?? null,
    period_start: row.period_start,
    period_end: row.period_end,
    amount: Number(row.amount),
    status: (row.status ?? "pending") as "pending" | "paid",
    payment_date: row.payment_date ?? null,
    payment_method: row.payment_method ?? null,
    reference_number: row.reference_number ?? null,
    notes: row.notes ?? null,
    staff_employment_status:
      row.staff_employment_status ?? staff?.employment_status ?? "active",
    school_id: staff?.school_id,
    branch_id: staff?.branch_id,
    staff_monthly_salary: Number(row.staff_monthly_salary ?? row.amount),
  };
}

export async function getPayroll(options?: {
  schoolId?: string;
  branchId?: string;
  status?: string;
  month?: number;
  year?: number;
  search?: string;
  position?: string;
  department?: string;
}): Promise<PayrollListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("payroll")
    .select(`
      id,
      staff_id,
      payroll_month,
      payroll_year,
      period_start,
      period_end,
      amount,
      status,
      payment_date,
      payment_method,
      reference_number,
      notes,
      staff_full_name,
      staff_position,
      staff_department,
      staff_photo_url,
      staff_employment_status,
      staff_monthly_salary,
      staff(
        name,
        role,
        department,
        employment_status,
        photo_url,
        school_id,
        branch_id,
        branches(name)
      )
    `)
    .order("payroll_year", { ascending: false })
    .order("payroll_month", { ascending: false })
    .order("staff_full_name", { ascending: true });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.month) {
    query = query.eq("payroll_month", options.month);
  }
  if (options?.year) {
    query = query.eq("payroll_year", options.year);
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
  if (options?.search) {
    const term = options.search.toLowerCase();
    rows = rows.filter((row) => {
      return (
        row.staff_name.toLowerCase().includes(term) ||
        row.staff_id.toLowerCase().includes(term) ||
        (row.staff_position ?? "").toLowerCase().includes(term) ||
        (row.staff_department ?? "").toLowerCase().includes(term) ||
        row.status.toLowerCase().includes(term)
      );
    });
  }
  if (options?.position) {
    rows = rows.filter((row) => row.staff_position === options.position);
  }
  if (options?.department) {
    rows = rows.filter((row) => row.staff_department === options.department);
  }

  return rows.map(
    ({ school_id: _s, branch_id: _b, staff_monthly_salary: _m, ...item }) =>
      item
  );
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
  month?: number;
  year?: number;
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
    const month = `${record.payroll_year}-${String(record.payroll_month).padStart(2, "0")}`;
    totals[month] = (totals[month] ?? 0) + record.amount;
  }
  return totals;
}

export type PayrollMonthListItem = {
  month: number;
  year: number;
  label: string;
};

export async function getPayrollMonths(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<PayrollMonthListItem[]> {
  const records = await getPayroll(options);
  const monthMap = new Map<string, PayrollMonthListItem>();
  for (const row of records) {
    const key = `${row.payroll_year}-${row.payroll_month}`;
    if (!monthMap.has(key)) {
      const date = new Date(Date.UTC(row.payroll_year, row.payroll_month - 1, 1));
      monthMap.set(key, {
        month: row.payroll_month,
        year: row.payroll_year,
        label: date.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      });
    }
  }
  return [...monthMap.values()].sort((a, b) =>
    a.year === b.year ? b.month - a.month : b.year - a.year
  );
}
