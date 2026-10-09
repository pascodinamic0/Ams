"use server";

import { actionError } from "@/lib/i18n/action-error";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { activatePendingStudentWithPayment } from "@/lib/services/enrollment-fees";
import { getTranslations } from "next-intl/server";

const confirmEnrollmentSchema = z.object({
  student_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  method: z.enum([
    "cash",
    "bank_transfer",
    "card",
    "mobile_money",
    "online",
    "other",
  ]),
  reference: z.string().optional(),
  proof_url: z.string().optional(),
  paid_at: z.string().optional(),
});

export type ConfirmEnrollmentFormData = z.infer<typeof confirmEnrollmentSchema>;

function toCents(value: number) {
  return Math.round(value * 100);
}

function allocateEnrollmentPayment(
  invoices: { id: string; balanceCents: number }[],
  amount: number
) {
  const totalCents = invoices.reduce((sum, invoice) => sum + invoice.balanceCents, 0);
  let remaining = toCents(amount);
  if (remaining <= 0 || totalCents <= 0) return { error: "invalid_amount" as const };
  if (remaining > totalCents) return { error: "payment_exceeds_balance" as const };

  const parts: { invoice_id: string; amount: number }[] = [];
  for (const invoice of invoices) {
    if (remaining <= 0) break;
    const pay = Math.min(invoice.balanceCents, remaining);
    if (pay <= 0) continue;
    parts.push({ invoice_id: invoice.id, amount: pay / 100 });
    remaining -= pay;
  }
  return { parts };
}

function mapRpcError(message: string): string {
  const keyMap: Record<string, string> = {
    not_authorized: "notAuthenticated",
    proof_required: "enrollmentProofRequired",
    student_not_found: "studentNotFound",
    invoice_not_found: "invoiceNotFound",
    payment_exceeds_balance: "paymentExceedsBalance",
    invalid_amount: "amountGreaterThanZero",
  };
  return keyMap[message] ?? message;
}

export async function confirmPendingEnrollment(input: ConfirmEnrollmentFormData) {
  const parsed = confirmEnrollmentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: invoices, error: invoiceError } = await supabase
    .from("fee_invoices")
    .select("id, amount, amount_paid, status, due_date")
    .eq("student_id", parsed.data.student_id)
    .eq("source", "enrollment")
    .order("due_date", { ascending: true });

  if (invoiceError) {
    return { error: invoiceError.message };
  }

  const openInvoices = (invoices ?? [])
    .map((invoice) => ({
      id: invoice.id as string,
      balanceCents: Math.max(
        0,
        toCents(Number(invoice.amount) - Number(invoice.amount_paid ?? 0))
      ),
      due_date: (invoice.due_date as string | null) ?? "",
      status: invoice.status as string | null,
    }))
    .filter((invoice) => invoice.balanceCents > 0 && invoice.status !== "paid")
    .sort((a, b) => a.due_date.localeCompare(b.due_date) || a.id.localeCompare(b.id));

  const allocation = allocateEnrollmentPayment(openInvoices, parsed.data.amount);
  if ("error" in allocation) {
    const te = await getTranslations("errors");
    const errorKey = allocation.error ?? "unknown_error";
    const mapped = mapRpcError(errorKey);
    return { error: te.has(mapped) ? te(mapped) : errorKey };
  }

  const paidAt = parsed.data.paid_at ?? new Date().toISOString();
  let result: {
    invoice_status: string;
    amount_paid: number;
    student_activated: boolean;
  } = {
    invoice_status: "pending",
    amount_paid: 0,
    student_activated: false,
  };

  for (const part of allocation.parts) {
    const { data, error } = await supabase.rpc("confirm_pending_enrollment", {
      p_student_id: parsed.data.student_id,
      p_invoice_id: part.invoice_id,
      p_amount: part.amount,
      p_method: parsed.data.method,
      p_reference: parsed.data.reference ?? null,
      p_proof_url: parsed.data.proof_url?.trim() || null,
      p_paid_at: paidAt,
    });

    if (error) {
      revalidateEnrollmentPaths();
      const te = await getTranslations("errors");
      const mapped = mapRpcError(error.message);
      const message = te.has(mapped) ? te(mapped) : error.message;
      return { error: message };
    }

    const payment = data as {
      invoice_status: string;
      amount_paid: number;
      student_activated: boolean;
    };
    result = {
      invoice_status: payment.invoice_status,
      amount_paid: result.amount_paid + part.amount,
      student_activated: Boolean(result.student_activated || payment.student_activated),
    };
  }

  if (!result.student_activated && allocation.parts.length > 0) {
    result.student_activated = await activatePendingStudentWithPayment(
      parsed.data.student_id
    );
  }

  revalidateEnrollmentPaths();

  return { data: result };
}

function revalidateEnrollmentPaths() {
  revalidatePath("/finance/enrollments");
  revalidatePath("/finance");
  revalidatePath("/finance/payments");
  revalidatePath("/finance/invoices");
  revalidatePath("/finance/outstanding");
  revalidatePath("/academic/students");
  revalidatePath("/academic");
}
