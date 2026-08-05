"use server";

import { revalidatePath } from "next/cache";
import { assertBranchAccess, getBranchSchoolId } from "@/lib/auth/assert";
import { FINANCE_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations/finance";

async function assertExpenseAccess(id: string) {
  const supabase = await createClient();
  const { data: expense } = await supabase
    .from("expenses")
    .select("id, branch_id")
    .eq("id", id)
    .maybeSingle();
  if (!expense) return { ok: false as const, error: "Expense not found" };
  return assertBranchAccess(expense.branch_id, FINANCE_PORTAL_ROLES);
}

export async function createExpense(input: ExpenseFormData) {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertBranchAccess(parsed.data.branch_id, FINANCE_PORTAL_ROLES);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      branch_id: parsed.data.branch_id,
      category: parsed.data.category,
      amount: parsed.data.amount,
      description: parsed.data.description || null,
      date: parsed.data.date,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/finance/expenses");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return { data: { id: data.id } };
}

export async function updateExpense(id: string, updates: Partial<ExpenseFormData>) {
  const parsed = expenseSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertExpenseAccess(id);
  if (!access.ok) return { error: access.error };

  if (parsed.data.branch_id) {
    const nextSchool = await getBranchSchoolId(parsed.data.branch_id);
    if (nextSchool !== access.schoolId) {
      return { error: "Cannot move expense to another school" };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      ...parsed.data,
      description: parsed.data.description === "" ? null : parsed.data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/finance/expenses");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return {};
}

export async function deleteExpense(id: string) {
  const access = await assertExpenseAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/finance/expenses");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return {};
}
