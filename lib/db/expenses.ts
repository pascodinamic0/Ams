import { createClient } from "@/lib/supabase/server";

export type ExpenseStatus = "pending" | "approved" | "rejected";

export type ExpenseListItem = {
  id: string;
  branch_id: string;
  branch_name: string | null;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  status: ExpenseStatus;
  receipt_number: string | null;
  task_id: string | null;
  approved_at: string | null;
};

export type ExpenseReceipt = ExpenseListItem & {
  school_id: string | null;
  school_name: string | null;
  school_logo_url: string | null;
  created_by_name: string | null;
  approved_by_name: string | null;
};

function mapExpenseRow(row: {
  id: string;
  branch_id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  status?: ExpenseStatus | null;
  receipt_number?: string | null;
  task_id?: string | null;
  approved_at?: string | null;
  branches?: { name?: string; school_id?: string } | null;
}): ExpenseListItem & { school_id?: string } {
  return {
    id: row.id,
    branch_id: row.branch_id,
    branch_name: row.branches?.name ?? null,
    category: row.category,
    amount: Number(row.amount),
    description: row.description,
    date: row.date,
    status: row.status ?? "pending",
    receipt_number: row.receipt_number ?? null,
    task_id: row.task_id ?? null,
    approved_at: row.approved_at ?? null,
    school_id: row.branches?.school_id,
  };
}

export async function getExpenses(options?: {
  schoolId?: string;
  branchId?: string;
  category?: string;
  status?: ExpenseStatus | ExpenseStatus[];
}): Promise<ExpenseListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("expenses")
    .select(
      "id, branch_id, category, amount, description, date, status, receipt_number, task_id, approved_at, branches(name, school_id)"
    )
    .order("date", { ascending: false });

  if (options?.branchId) {
    query = query.eq("branch_id", options.branchId);
  }

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    query = query.in("status", statuses);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getExpenses error:", error);
    return [];
  }

  let rows = (data ?? []).map((row) =>
    mapExpenseRow(row as Parameters<typeof mapExpenseRow>[0])
  );

  if (options?.schoolId) {
    rows = rows.filter((r) => r.school_id === options.schoolId);
  }

  return rows.map(({ school_id: _s, ...item }) => item);
}

export async function getExpenseById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*, branches(name, school_id)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getExpenseReceipt(id: string): Promise<ExpenseReceipt | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      id, branch_id, category, amount, description, date,
      status, receipt_number, task_id, approved_at, created_by, approved_by,
      branches(name, school_id, schools(name, logo_url))
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getExpenseReceipt error:", error);
    return null;
  }

  const profileIds = [data.created_by, data.approved_by].filter(
    (value): value is string => Boolean(value)
  );
  const names = new Map<string, string>();
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", profileIds);
    for (const profile of profiles ?? []) {
      names.set(profile.id, profile.name);
    }
  }

  const branches = data.branches as {
    name?: string;
    school_id?: string;
    schools?: { name?: string; logo_url?: string | null } | null;
  } | null;

  return {
    id: data.id,
    branch_id: data.branch_id,
    branch_name: branches?.name ?? null,
    category: data.category,
    amount: Number(data.amount),
    description: data.description,
    date: data.date,
    status: (data.status as ExpenseStatus) ?? "pending",
    receipt_number: data.receipt_number,
    task_id: data.task_id,
    approved_at: data.approved_at,
    school_id: branches?.school_id ?? null,
    school_name: branches?.schools?.name ?? null,
    school_logo_url: branches?.schools?.logo_url ?? null,
    created_by_name: data.created_by ? names.get(data.created_by) ?? null : null,
    approved_by_name: data.approved_by ? names.get(data.approved_by) ?? null : null,
  };
}

export async function getExpenseCategories(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<string[]> {
  const expenses = await getExpenses(options);
  return [...new Set(expenses.map((e) => e.category))].sort();
}

export async function getExpenseTotal(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<number> {
  const expenses = await getExpenses({ ...options, status: "approved" });
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export async function getMonthlyExpenseTotals(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<Record<string, number>> {
  const expenses = await getExpenses({ ...options, status: "approved" });
  const totals: Record<string, number> = {};
  for (const expense of expenses) {
    const month = expense.date.slice(0, 7);
    totals[month] = (totals[month] ?? 0) + expense.amount;
  }
  return totals;
}

export async function getExpensesByCategory(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<{ name: string; value: number }[]> {
  const expenses = await getExpenses({ ...options, status: "approved" });
  const byCategory = new Map<string, number>();
  for (const expense of expenses) {
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + expense.amount
    );
  }
  return [...byCategory.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
