"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  feeStructureSchema,
  type FeeStructureFormData,
} from "@/lib/validations/finance";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function deriveInvoiceStatus(amount: number, amountPaid: number, dueDate: string) {
  if (amountPaid >= amount) return "paid" as const;
  if (new Date(dueDate) < new Date(new Date().toDateString())) return "overdue" as const;
  return "pending" as const;
}

type EnrollmentInvoiceRow = {
  id: string;
  student_id: string;
  amount: number | string;
  amount_paid: number | string | null;
  due_date: string;
  status: string | null;
};

/**
 * Pending enrollment invoices copy the fee amount at registration.
 * After a catalog price change, rewrite that year price and leave amount_paid alone.
 * The stored amount cannot drop below what was already paid.
 */
async function syncPendingEnrollmentYearPrice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  feeStructureId: string,
  catalogAmount: number
): Promise<string | null> {
  const price = roundMoney(catalogAmount);
  const { data: pendingStudents, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("status", "pending");
  if (studentError) return studentError.message;

  const studentIds = (pendingStudents ?? []).map((student) => student.id as string);
  if (studentIds.length === 0) return null;

  const invoices: EnrollmentInvoiceRow[] = [];
  for (let offset = 0; offset < studentIds.length; offset += 150) {
    const slice = studentIds.slice(offset, offset + 150);
    const { data, error } = await supabase
      .from("fee_invoices")
      .select("id, student_id, amount, amount_paid, due_date, status")
      .eq("fee_structure_id", feeStructureId)
      .eq("source", "enrollment")
      .in("student_id", slice);
    if (error) return error.message;
    invoices.push(...((data ?? []) as EnrollmentInvoiceRow[]));
  }

  const touchedStudents = new Set<string>();
  const updates: { id: string; amount: number; status: "pending" | "paid" | "overdue" }[] = [];
  for (const invoice of invoices) {
    const paid = roundMoney(Number(invoice.amount_paid ?? 0));
    const nextAmount = Math.max(price, paid);
    const nextStatus = deriveInvoiceStatus(nextAmount, paid, invoice.due_date);
    if (roundMoney(Number(invoice.amount)) === nextAmount && invoice.status === nextStatus) {
      continue;
    }
    touchedStudents.add(invoice.student_id);
    updates.push({ id: invoice.id, amount: nextAmount, status: nextStatus });
  }

  const now = new Date().toISOString();
  for (let offset = 0; offset < updates.length; offset += 20) {
    const batch = updates.slice(offset, offset + 20);
    const results = await Promise.all(
      batch.map((row) =>
        supabase
          .from("fee_invoices")
          .update({
            amount: row.amount,
            status: row.status,
            updated_at: now,
          })
          .eq("id", row.id)
      )
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return failed.error.message;
  }

  if (touchedStudents.size > 0) {
    await activateSettledPendingStudents(supabase, [...touchedStudents]);
  }
  return null;
}

/** A price cut can cover the last open enrollment invoice. Activate that student. */
async function activateSettledPendingStudents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentIds: string[]
) {
  const { data: stillOpen, error } = await supabase
    .from("fee_invoices")
    .select("student_id")
    .eq("source", "enrollment")
    .in("student_id", studentIds)
    .neq("status", "paid");
  if (error) {
    console.error("activateSettledPendingStudents lookup error:", error);
    return;
  }

  const openIds = new Set((stillOpen ?? []).map((row) => row.student_id as string));
  const settledIds = studentIds.filter((id) => !openIds.has(id));
  if (settledIds.length === 0) return;

  const admin = createAdminClient();
  if (!admin) return;

  const { error: updateError } = await admin
    .from("students")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .in("id", settledIds)
    .eq("status", "pending");
  if (updateError) {
    console.error("activateSettledPendingStudents error:", updateError);
    return;
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
}

export async function createFeeStructure(input: FeeStructureFormData) {
  const parsed = feeStructureSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data, error } = await supabase
    .from("fee_structures")
    .insert({
      name: parsed.data.name,
      branch_id: parsed.data.branch_id,
      amount: parsed.data.amount,
      class_id: parsed.data.class_id || null,
      description: parsed.data.description || null,
      school_year: parsed.data.school_year,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/finance/fee-structure");
  return { data: { id: data.id } };
}

export async function updateFeeStructure(
  id: string,
  updates: Partial<FeeStructureFormData>
) {
  const parsed = feeStructureSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const payload = Object.fromEntries(
    Object.entries({
      ...parsed.data,
      class_id:
        parsed.data.class_id === undefined
          ? undefined
          : parsed.data.class_id === ""
            ? null
            : parsed.data.class_id,
      description:
        parsed.data.description === undefined
          ? undefined
          : parsed.data.description || null,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined)
  );

  const { error } = await supabase
    .from("fee_structures")
    .update(payload)
    .eq("id", id);

  if (error) return { error: error.message };

  if (parsed.data.amount !== undefined) {
    const syncError = await syncPendingEnrollmentYearPrice(
      supabase,
      id,
      parsed.data.amount
    );
    if (syncError) return { error: syncError };
  }

  revalidatePath("/finance/fee-structure");
  revalidatePath("/finance/enrollments");
  revalidatePath("/finance");
  revalidatePath("/finance/invoices");
  revalidatePath("/finance/outstanding");
  return {} as { error?: string };
}

export async function deleteFeeStructure(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("fee_structures").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/finance/fee-structure");
  return {} as { error?: string };
}
