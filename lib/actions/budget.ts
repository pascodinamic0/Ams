"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeRole } from "@/lib/auth/rbac";
import {
  budgetLineItemSchema,
  budgetPlanSchema,
  type BudgetLineItemFormData,
  type BudgetPlanFormData,
} from "@/lib/validations/finance";

const FINANCE_MANAGER_ROLES = new Set([
  "super_admin",
  "finance_officer",
  "accountant",
]);

async function requireFinanceManager() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return { error: "Your account is not linked to a school" as const };
  }

  const role = normalizeRole(profile.role);
  if (!FINANCE_MANAGER_ROLES.has(role)) {
    return { error: "Only finance can manage budget plans" as const };
  }

  return { supabase, profile };
}

function revalidateBudgetPaths(planId?: string) {
  revalidatePath("/finance/budget");
  revalidatePath("/finance");
  if (planId) {
    revalidatePath(`/finance/budget/${planId}`);
  }
  revalidatePath("/academic/tasks");
}

export async function createBudgetPlan(input: BudgetPlanFormData) {
  const parsed = budgetPlanSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data, error } = await auth.supabase
    .from("budget_plans")
    .insert({
      school_id: auth.profile.school_id,
      year: parsed.data.year,
      title: parsed.data.title,
      label: parsed.data.label || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status ?? "draft",
      created_by: auth.profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidateBudgetPaths(data.id);
  return { data: { id: data.id } };
}

export async function updateBudgetPlan(
  id: string,
  input: Partial<BudgetPlanFormData>
) {
  const parsed = budgetPlanSchema.partial().safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.year !== undefined) updates.year = parsed.data.year;
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.label !== undefined) updates.label = parsed.data.label || null;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes || null;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const { error } = await auth.supabase
    .from("budget_plans")
    .update(updates)
    .eq("id", id)
    .eq("school_id", auth.profile.school_id);

  if (error) return { error: error.message };

  revalidateBudgetPaths(id);
  return {};
}

export async function deleteBudgetPlan(id: string) {
  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { error } = await auth.supabase
    .from("budget_plans")
    .delete()
    .eq("id", id)
    .eq("school_id", auth.profile.school_id);

  if (error) return { error: error.message };

  revalidateBudgetPaths();
  return {};
}

export async function createBudgetLineItem(
  planId: string,
  input: BudgetLineItemFormData
) {
  const parsed = budgetLineItemSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: plan } = await auth.supabase
    .from("budget_plans")
    .select("id")
    .eq("id", planId)
    .eq("school_id", auth.profile.school_id)
    .single();

  if (!plan) return { error: "Budget plan not found" };

  const quantity = parsed.data.quantity;
  const unitCost = parsed.data.unit_cost;
  const total = Math.round(quantity * unitCost * 100) / 100;

  const { data, error } = await auth.supabase
    .from("budget_line_items")
    .insert({
      plan_id: planId,
      category: parsed.data.category,
      name: parsed.data.name,
      description: parsed.data.description || null,
      quantity,
      unit_cost: unitCost,
      total,
      period_type: parsed.data.period_type,
      period_key: parsed.data.period_key,
      sort_order: parsed.data.sort_order ?? 0,
      status: parsed.data.status ?? "planned",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidateBudgetPaths(planId);
  return { data: { id: data.id } };
}

export async function updateBudgetLineItem(
  id: string,
  input: Partial<BudgetLineItemFormData>
) {
  const parsed = budgetLineItemSchema.partial().safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: existing } = await auth.supabase
    .from("budget_line_items")
    .select("id, plan_id, quantity, unit_cost, budget_plans!inner(school_id)")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Budget line not found" };
  const planMeta = existing.budget_plans as { school_id?: string } | null;
  if (planMeta?.school_id !== auth.profile.school_id) {
    return { error: "Budget line not found" };
  }

  const quantity =
    parsed.data.quantity !== undefined
      ? parsed.data.quantity
      : Number(existing.quantity);
  const unitCost =
    parsed.data.unit_cost !== undefined
      ? parsed.data.unit_cost
      : Number(existing.unit_cost);

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    quantity,
    unit_cost: unitCost,
    total: Math.round(quantity * unitCost * 100) / 100,
  };
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) {
    updates.description = parsed.data.description || null;
  }
  if (parsed.data.period_type !== undefined) {
    updates.period_type = parsed.data.period_type;
  }
  if (parsed.data.period_key !== undefined) {
    updates.period_key = parsed.data.period_key;
  }
  if (parsed.data.sort_order !== undefined) {
    updates.sort_order = parsed.data.sort_order;
  }
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const { error } = await auth.supabase
    .from("budget_line_items")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateBudgetPaths(existing.plan_id as string);
  return {};
}

export async function deleteBudgetLineItem(id: string) {
  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: existing } = await auth.supabase
    .from("budget_line_items")
    .select("id, plan_id, budget_plans!inner(school_id)")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Budget line not found" };
  const planMeta = existing.budget_plans as { school_id?: string } | null;
  if (planMeta?.school_id !== auth.profile.school_id) {
    return { error: "Budget line not found" };
  }

  const { error } = await auth.supabase
    .from("budget_line_items")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateBudgetPaths(existing.plan_id as string);
  return {};
}

/** Create an academic-admin school_task from a budget line item. */
export async function createTaskFromBudgetLine(lineId: string) {
  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: line } = await auth.supabase
    .from("budget_line_items")
    .select("id, plan_id, task_id, budget_plans!inner(school_id)")
    .eq("id", lineId)
    .single();

  if (!line) return { error: "Budget line not found" };
  if (line.task_id) return { error: "A task already exists for this line" };

  const plan = line.budget_plans as { school_id?: string } | null;
  if (!plan?.school_id || plan.school_id !== auth.profile.school_id) {
    return { error: "Budget line not found" };
  }

  const { data: taskId, error } = await auth.supabase.rpc(
    "create_task_from_budget_line",
    { p_line_id: lineId }
  );

  if (error) return { error: error.message };

  revalidateBudgetPaths(line.plan_id as string);
  return { data: { taskId: taskId as string } };
}
