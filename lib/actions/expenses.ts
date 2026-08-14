"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations/finance";
import { normalizeRole } from "@/lib/auth/rbac";

const TASK_APPROVER_ROLES = new Set([
  "super_admin",
  "academic_admin",
  "admin_coordinator",
  "principal",
  "registrar",
  "admissions_officer",
  "pedagogy_coordinator",
]);

async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile) return await actionError("profileNotFound");
  return { supabase, profile };
}

function revalidateExpensePaths() {
  revalidatePath("/finance/expenses");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  revalidatePath("/academic");
  revalidatePath("/academic/tasks");
}

export async function createExpense(input: ExpenseFormData) {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireProfile();
  if ("error" in auth) return { error: auth.error };

  const { data, error } = await auth.supabase
    .from("expenses")
    .insert({
      branch_id: parsed.data.branch_id,
      category: parsed.data.category,
      amount: parsed.data.amount,
      description: parsed.data.description || null,
      date: parsed.data.date,
      status: "pending",
      created_by: auth.profile.id,
    })
    .select("id, task_id, status")
    .single();

  if (error) return { error: error.message };

  revalidateExpensePaths();
  return {
    data: {
      id: data.id,
      task_id: data.task_id as string | null,
      status: data.status as string,
    },
  };
}

export async function updateExpense(id: string, updates: Partial<ExpenseFormData>) {
  const parsed = expenseSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireProfile();
  if ("error" in auth) return { error: auth.error };

  const { data: existing } = await auth.supabase
    .from("expenses")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!existing) return await actionError("expenseNotFound");
  if (existing.status === "approved") {
    return await actionError("approvedExpenseNoEdit");
  }

  const { error } = await auth.supabase
    .from("expenses")
    .update({
      ...parsed.data,
      description: parsed.data.description === "" ? null : parsed.data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateExpensePaths();
  return {} as { error?: string };
}

export async function deleteExpense(id: string) {
  const auth = await requireProfile();
  if ("error" in auth) return { error: auth.error };

  const { data: existing } = await auth.supabase
    .from("expenses")
    .select("id, status, task_id")
    .eq("id", id)
    .single();

  if (!existing) return await actionError("expenseNotFound");
  if (existing.status === "approved") {
    return await actionError("approvedExpensesCannotDelete");
  }

  if (existing.task_id) {
    await auth.supabase.from("school_tasks").delete().eq("id", existing.task_id);
  }

  const { error } = await auth.supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateExpensePaths();
  return {} as { error?: string };
}

/**
 * Academic admin (task workspace roles) approve or reject a finance expense task.
 * On approve, issues a receipt number for the finance record.
 */
export async function decideExpenseTask(
  taskId: string,
  decision: "approved" | "rejected"
) {
  const auth = await requireProfile();
  if ("error" in auth) return { error: auth.error };

  const role = normalizeRole(auth.profile.role);
  if (!TASK_APPROVER_ROLES.has(role)) {
    return await actionError("onlyAcademicAdminsApproveExpense");
  }
  if (!auth.profile.school_id) {
    return await actionError("noSchoolLinked");
  }

  const { data: task } = await auth.supabase
    .from("school_tasks")
    .select("id, school_id, related_type, related_id, status")
    .eq("id", taskId)
    .eq("school_id", auth.profile.school_id)
    .single();

  if (!task) return await actionError("taskNotFound");
  if (task.related_type !== "expense" || !task.related_id) {
    return await actionError("taskNotLinkedExpense");
  }
  if (task.status === "done") {
    return await actionError("expenseAlreadyDecided");
  }

  const { data: expense } = await auth.supabase
    .from("expenses")
    .select("id, status, receipt_number, branch_id, branches(school_id)")
    .eq("id", task.related_id)
    .single();

  if (!expense) return await actionError("linkedExpenseNotFound");
  if (expense.status !== "pending") {
    return await actionError("expenseNoLongerPending");
  }

  const branch = expense.branches as { school_id?: string } | null;
  if (branch?.school_id && branch.school_id !== auth.profile.school_id) {
    return await actionError("expenseNotInSchool");
  }

  let receiptNumber: string | null = null;
  if (decision === "approved") {
    const { data: nextNumber, error: receiptError } = await auth.supabase.rpc(
      "next_expense_receipt_number",
      { p_school_id: auth.profile.school_id }
    );
    if (receiptError) return { error: receiptError.message };
    receiptNumber = (nextNumber as string) ?? null;
  }

  const { error: expenseError } = await auth.supabase
    .from("expenses")
    .update({
      status: decision,
      approved_by: auth.profile.id,
      approved_at: new Date().toISOString(),
      receipt_number: receiptNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", expense.id)
    .eq("status", "pending");

  if (expenseError) return { error: expenseError.message };

  const { error: taskError } = await auth.supabase
    .from("school_tasks")
    .update({
      status: "done",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (taskError) return { error: taskError.message };

  revalidateExpensePaths();
  if (expense.id) {
    revalidatePath(`/finance/expenses/${expense.id}/receipt`);
  }

  return {
    data: {
      expenseId: expense.id,
      status: decision,
      receiptNumber,
    },
  };
}
