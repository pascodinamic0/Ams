import { createClient } from "@/lib/supabase/server";

export type ExpenseListItem = {
  id: string;
  branch_id: string;
  branch_name: string | null;
  category: string;
  amount: number;
  description: string | null;
  date: string;
};

function mapExpenseRow(row: {
  id: string;
  branch_id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
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
    school_id: row.branches?.school_id,
  };
}

export async function getExpenses(options?: {
  schoolId?: string;
  branchId?: string;
  category?: string;
}): Promise<ExpenseListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("expenses")
    .select("id, branch_id, category, amount, description, date, branches(name, school_id)")
    .order("date", { ascending: false });

  if (options?.branchId) {
    query = query.eq("branch_id", options.branchId);
  }

  if (options?.category) {
    query = query.eq("category", options.category);
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
  const expenses = await getExpenses(options);
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export async function getMonthlyExpenseTotals(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<Record<string, number>> {
  const expenses = await getExpenses(options);
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
  const expenses = await getExpenses(options);
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
