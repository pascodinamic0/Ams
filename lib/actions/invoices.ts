"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations/finance";

function deriveInvoiceStatus(amount: number, amountPaid: number, dueDate: string) {
  if (amountPaid >= amount) return "paid";
  if (new Date(dueDate) < new Date(new Date().toDateString())) return "overdue";
  return "pending";
}

export async function createInvoice(input: InvoiceFormData) {
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  let amount = parsed.data.amount;
  const feeStructureId = parsed.data.fee_structure_id || null;

  if (feeStructureId) {
    const { data: structure } = await supabase
      .from("fee_structures")
      .select("amount")
      .eq("id", feeStructureId)
      .single();
    if (structure) amount = Number(structure.amount);
  }

  const status = deriveInvoiceStatus(amount, 0, parsed.data.due_date);

  const { data, error } = await supabase
    .from("fee_invoices")
    .insert({
      student_id: parsed.data.student_id,
      fee_structure_id: feeStructureId,
      amount,
      amount_paid: 0,
      due_date: parsed.data.due_date,
      status,
      description: parsed.data.description || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  revalidatePath("/parent/fees");
  return { data: { id: data.id } };
}

export async function updateInvoice(
  id: string,
  updates: Partial<InvoiceFormData>
) {
  const parsed = invoiceSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("fee_invoices")
    .select("amount_paid")
    .eq("id", id)
    .single();

  const amount = parsed.data.amount ?? undefined;
  const dueDate = parsed.data.due_date;
  const amountPaid = Number(existing?.amount_paid ?? 0);

  const payload: Record<string, unknown> = {
    ...parsed.data,
    fee_structure_id:
      parsed.data.fee_structure_id === ""
        ? null
        : parsed.data.fee_structure_id,
    updated_at: new Date().toISOString(),
  };

  if (amount !== undefined && dueDate) {
    payload.status = deriveInvoiceStatus(amount, amountPaid, dueDate);
  } else if (dueDate) {
    const { data: inv } = await supabase
      .from("fee_invoices")
      .select("amount")
      .eq("id", id)
      .single();
    if (inv) {
      payload.status = deriveInvoiceStatus(
        Number(inv.amount),
        amountPaid,
        dueDate
      );
    }
  }

  const { error } = await supabase.from("fee_invoices").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  return {};
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("fee_invoices").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  return {};
}
