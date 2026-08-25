import { logQueryError } from "@/lib/supabase/log-query-error";
import { createClient } from "@/lib/supabase/server";

export type BudgetPlanStatus = "draft" | "active" | "archived";
export type BudgetLineStatus = "planned" | "in_progress" | "done" | "cancelled";
export type BudgetPeriodType = "year" | "quarter" | "trimester" | "month";

export type BudgetPlanListItem = {
  id: string;
  school_id: string;
  year: number;
  label: string | null;
  title: string;
  status: BudgetPlanStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  line_count: number;
  total: number;
};

export type BudgetLineItem = {
  id: string;
  plan_id: string;
  category: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_cost: number;
  total: number;
  period_type: BudgetPeriodType;
  period_key: string;
  sort_order: number;
  status: BudgetLineStatus;
  task_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetPlanDetail = BudgetPlanListItem & {
  created_by: string | null;
  lines: BudgetLineItem[];
  totalsByCategory: { category: string; total: number; count: number }[];
  totalsByPeriod: { period_type: string; period_key: string; total: number; count: number }[];
};

function mapLine(row: {
  id: string;
  plan_id: string;
  category: string;
  name: string;
  description: string | null;
  quantity: number | string;
  unit_cost: number | string;
  total: number | string;
  period_type: BudgetPeriodType;
  period_key: string;
  sort_order: number;
  status: BudgetLineStatus;
  task_id: string | null;
  created_at: string;
  updated_at: string;
}): BudgetLineItem {
  return {
    id: row.id,
    plan_id: row.plan_id,
    category: row.category,
    name: row.name,
    description: row.description,
    quantity: Number(row.quantity),
    unit_cost: Number(row.unit_cost),
    total: Number(row.total),
    period_type: row.period_type,
    period_key: row.period_key,
    sort_order: row.sort_order,
    status: row.status,
    task_id: row.task_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getBudgetPlans(schoolId: string): Promise<BudgetPlanListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_plans")
    .select(
      "id, school_id, year, label, title, status, notes, created_at, updated_at, budget_line_items(id, total)"
    )
    .eq("school_id", schoolId)
    .order("year", { ascending: false })
    .order("title", { ascending: true });

  if (error) {
    logQueryError("getBudgetPlans error:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const lines = (row.budget_line_items ?? []) as { id: string; total: number | string }[];
    return {
      id: row.id,
      school_id: row.school_id,
      year: row.year,
      label: row.label,
      title: row.title,
      status: row.status as BudgetPlanStatus,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      line_count: lines.length,
      total: lines.reduce((sum, line) => sum + Number(line.total), 0),
    };
  });
}

export async function getBudgetPlanById(
  id: string,
  schoolId?: string
): Promise<BudgetPlanDetail | null> {
  const supabase = await createClient();
  let query = supabase
    .from("budget_plans")
    .select(
      "id, school_id, year, label, title, status, notes, created_by, created_at, updated_at"
    )
    .eq("id", id);

  if (schoolId) {
    query = query.eq("school_id", schoolId);
  }

  const { data: plan, error } = await query.single();
  if (error || !plan) {
    if (error) logQueryError("getBudgetPlanById error:", error);
    return null;
  }

  const { data: linesData, error: linesError } = await supabase
    .from("budget_line_items")
    .select(
      "id, plan_id, category, name, description, quantity, unit_cost, total, period_type, period_key, sort_order, status, task_id, created_at, updated_at"
    )
    .eq("plan_id", id)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (linesError) {
    logQueryError("getBudgetPlanById lines error:", linesError);
  }

  const lines = (linesData ?? []).map((row) =>
    mapLine(row as Parameters<typeof mapLine>[0])
  );
  const total = lines.reduce((sum, line) => sum + line.total, 0);

  const categoryMap = new Map<string, { total: number; count: number }>();
  const periodMap = new Map<string, { period_type: string; period_key: string; total: number; count: number }>();

  for (const line of lines) {
    const cat = categoryMap.get(line.category) ?? { total: 0, count: 0 };
    cat.total += line.total;
    cat.count += 1;
    categoryMap.set(line.category, cat);

    const periodId = `${line.period_type}:${line.period_key}`;
    const period = periodMap.get(periodId) ?? {
      period_type: line.period_type,
      period_key: line.period_key,
      total: 0,
      count: 0,
    };
    period.total += line.total;
    period.count += 1;
    periodMap.set(periodId, period);
  }

  return {
    id: plan.id,
    school_id: plan.school_id,
    year: plan.year,
    label: plan.label,
    title: plan.title,
    status: plan.status as BudgetPlanStatus,
    notes: plan.notes,
    created_by: plan.created_by,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
    line_count: lines.length,
    total,
    lines,
    totalsByCategory: [...categoryMap.entries()]
      .map(([category, value]) => ({ category, ...value }))
      .sort((a, b) => a.category.localeCompare(b.category)),
    totalsByPeriod: [...periodMap.values()].sort((a, b) =>
      `${a.period_type}-${a.period_key}`.localeCompare(`${b.period_type}-${b.period_key}`)
    ),
  };
}

export async function getBudgetLineById(id: string): Promise<BudgetLineItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_line_items")
    .select(
      "id, plan_id, category, name, description, quantity, unit_cost, total, period_type, period_key, sort_order, status, task_id, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) logQueryError("getBudgetLineById error:", error);
    return null;
  }

  return mapLine(data as Parameters<typeof mapLine>[0]);
}
