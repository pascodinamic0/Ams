"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyStudentGuardians } from "@/lib/services/notifications";
import { paymentSchema, type PaymentFormData } from "@/lib/validations/finance";

function deriveInvoiceStatus(amount: number, amountPaid: number, dueDate: string) {
  if (amountPaid >= amount) return "paid";
  if (new Date(dueDate) < new Date(new Date().toDateString())) return "overdue";
  return "pending";
}

export async function recordPayment(input: PaymentFormData) {
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: invoice, error: fetchError } = await supabase
    .from("fee_invoices")
    .select("id, amount, amount_paid, due_date, student_id")
    .eq("id", parsed.data.invoice_id)
    .single();

  if (fetchError || !invoice) {
    return { error: "Invoice not found" };
  }

  const currentPaid = Number(invoice.amount_paid ?? 0);
  const invoiceAmount = Number(invoice.amount);
  const remaining = invoiceAmount - currentPaid;

  if (parsed.data.amount > remaining) {
    return { error: `Payment exceeds remaining balance (${remaining.toFixed(2)})` };
  }

  const newAmountPaid = currentPaid + parsed.data.amount;
  const newStatus = deriveInvoiceStatus(
    invoiceAmount,
    newAmountPaid,
    invoice.due_date
  );

  const { error: paymentError } = await supabase.from("fee_payments").insert({
    invoice_id: parsed.data.invoice_id,
    amount: parsed.data.amount,
    method: parsed.data.method,
    reference: parsed.data.reference || null,
    paid_at: parsed.data.paid_at || new Date().toISOString(),
    recorded_by: user.id,
  });

  if (paymentError) return { error: paymentError.message };

  const { error: updateError } = await supabase
    .from("fee_invoices")
    .update({
      amount_paid: newAmountPaid,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.invoice_id);

  if (updateError) return { error: updateError.message };

  await notifyStudentGuardians(invoice.student_id, {
    title: "Payment received",
    body: `A payment of ${parsed.data.amount.toFixed(2)} was recorded. Invoice status: ${newStatus}.`,
  });

  revalidatePath("/finance/payments");
  revalidatePath("/notifications");
  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  revalidatePath("/parent/fees");
  return { data: { status: newStatus, amount_paid: newAmountPaid } };
}
