"use server";

import { actionError } from "@/lib/i18n/action-error";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

const confirmEnrollmentSchema = z.object({
  student_id: z.string().uuid(),
  invoice_id: z.string().uuid(),
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
  proof_url: z.string().min(1, "proofRequired"),
  paid_at: z.string().optional(),
});

export type ConfirmEnrollmentFormData = z.infer<typeof confirmEnrollmentSchema>;

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

  const { data, error } = await supabase.rpc("confirm_pending_enrollment", {
    p_student_id: parsed.data.student_id,
    p_invoice_id: parsed.data.invoice_id,
    p_amount: parsed.data.amount,
    p_method: parsed.data.method,
    p_reference: parsed.data.reference ?? null,
    p_proof_url: parsed.data.proof_url,
    p_paid_at: parsed.data.paid_at ?? new Date().toISOString(),
  });

  if (error) {
    const te = await getTranslations("errors");
    const mapped = mapRpcError(error.message);
    const message = te.has(mapped) ? te(mapped) : error.message;
    return { error: message };
  }

  revalidatePath("/finance/enrollments");
  revalidatePath("/finance");
  revalidatePath("/finance/payments");
  revalidatePath("/finance/invoices");
  revalidatePath("/finance/outstanding");
  revalidatePath("/academic/students");
  revalidatePath("/academic");

  const result = data as {
    invoice_status: string;
    amount_paid: number;
    student_activated: boolean;
  };

  return { data: result };
}
