"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations/finance";

export async function createExpense(input: ExpenseFormData) {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

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
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/finance/expenses");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  return {};
}
