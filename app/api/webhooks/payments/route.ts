import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Payment webhook handler for payment providers (Paystack, Flutterwave, etc.)
 * Verify signature, find invoice by reference, record payment, update invoice.
 *
 * Configure in your payment provider dashboard to send POST to:
 *   https://your-domain.com/api/webhooks/payments
 *
 * Expected payload (generic):
 *   { reference: string, amount: number, status: string, ... }
 *
 * Environment:
 *   PAYMENT_WEBHOOK_SECRET - shared secret for signature verification
 *   SUPABASE_SERVICE_ROLE_KEY - for server-side DB writes (bypass RLS)
 */

function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PAYMENT_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Supabase credentials not configured for webhook");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-payment-signature") ??
    request.headers.get("x-webhook-signature") ??
    request.headers.get("stripe-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: { reference?: string; amount?: number; status?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reference = body.reference ?? (body as Record<string, unknown>).reference;
  const amount = body.amount ?? (body as Record<string, unknown>).amount;
  const status = (body.status ?? (body as Record<string, unknown>).status) as
    | string
    | undefined;

  if (!reference || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "Missing reference or invalid amount" },
      { status: 400 }
    );
  }

  // Provider-specific: e.g. Paystack uses "success", Stripe uses "payment_intent.succeeded"
  const isSuccess =
    status === "success" ||
    status === "completed" ||
    status === "paid" ||
    status === "payment_intent.succeeded";

  if (!isSuccess) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Find invoice by reference (store provider reference in payments or fee_invoices)
  const { data: invoice } = await supabase
    .from("fee_invoices")
    .select("id, amount, amount_paid, status")
    .eq("id", reference)
    .single();

  if (!invoice) {
    // Try payments.reference as fallback - some providers use custom reference
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("invoice_id")
      .eq("reference", reference)
      .maybeSingle();

    if (existingPayment) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
    return NextResponse.json(
      { error: "Invoice not found for reference" },
      { status: 404 }
    );
  }

  const newAmountPaid = Number(invoice.amount_paid ?? 0) + amount;
  const invoiceAmount = Number(invoice.amount);
  const newStatus = newAmountPaid >= invoiceAmount ? "paid" : "pending";

  await supabase.from("payments").insert({
    invoice_id: invoice.id,
    amount,
    method: "online",
    reference: String(reference),
    paid_at: new Date().toISOString(),
  });

  await supabase
    .from("fee_invoices")
    .update({
      amount_paid: newAmountPaid,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoice.id);

  return NextResponse.json({ received: true }, { status: 200 });
}
