import { createClient } from "@supabase/supabase-js";

export type RecordOnlinePaymentInput = {
  invoiceId: string;
  amount: number;
  reference: string;
  method?: "online" | "card" | "mobile_money";
};

export type RecordOnlinePaymentResult =
  | { ok: true; duplicate?: boolean; invoiceId: string; status: string }
  | { ok: false; error: string; status: number };

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey);
}

/**
 * Idempotent online payment recorder for webhooks (Stripe and generic providers).
 * Uses fee_payments.reference uniqueness for dedupe.
 */
export async function recordOnlinePayment(
  input: RecordOnlinePaymentInput
): Promise<RecordOnlinePaymentResult> {
  if (!input.invoiceId || !input.reference) {
    return { ok: false, error: "Missing invoice or reference", status: 400 };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Invalid amount", status: 400 };
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return { ok: false, error: "Server configuration error", status: 500 };
  }

  const { data: existingPayment } = await supabase
    .from("fee_payments")
    .select("id, invoice_id")
    .eq("reference", input.reference)
    .maybeSingle();

  if (existingPayment) {
    return {
      ok: true,
      duplicate: true,
      invoiceId: existingPayment.invoice_id,
      status: "duplicate",
    };
  }

  const { data: invoice } = await supabase
    .from("fee_invoices")
    .select("id, amount, amount_paid, status")
    .eq("id", input.invoiceId)
    .maybeSingle();

  if (!invoice) {
    return { ok: false, error: "Invoice not found for reference", status: 404 };
  }

  const { error: insertError } = await supabase.from("fee_payments").insert({
    invoice_id: invoice.id,
    amount: input.amount,
    method: input.method ?? "online",
    reference: input.reference,
    paid_at: new Date().toISOString(),
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        ok: true,
        duplicate: true,
        invoiceId: invoice.id,
        status: "duplicate",
      };
    }
    console.error("recordOnlinePayment insert error:", insertError);
    return { ok: false, error: "Failed to record payment", status: 500 };
  }

  const newAmountPaid = Number(invoice.amount_paid ?? 0) + input.amount;
  const invoiceAmount = Number(invoice.amount);
  const newStatus = newAmountPaid >= invoiceAmount ? "paid" : "pending";

  const { error: updateError } = await supabase
    .from("fee_invoices")
    .update({
      amount_paid: newAmountPaid,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoice.id);

  if (updateError) {
    console.error("recordOnlinePayment invoice update error:", updateError);
    return { ok: false, error: "Failed to update invoice", status: 500 };
  }

  return { ok: true, invoiceId: invoice.id, status: newStatus };
}
