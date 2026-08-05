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
 *   { reference: string, amount: number, status: string, event_id?: string, ... }
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

  // Stripe-style headers are not raw HMAC hex; reject them for this generic handler.
  if (signature.includes("t=") && signature.includes("v1=")) {
    console.error("Stripe signature format is not supported by the generic payment webhook");
    return false;
  }

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length) return false;
    return timingSafeEqual(sigBuf, expBuf);
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
    request.headers.get("x-webhook-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: {
    reference?: string;
    amount?: number;
    status?: string;
    event_id?: string;
    id?: string;
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reference = body.reference;
  const amount = body.amount;
  const status = body.status;
  const eventId = body.event_id ?? body.id;

  if (!reference || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "Missing reference or invalid amount" },
      { status: 400 }
    );
  }

  const isSuccess =
    status === "success" ||
    status === "completed" ||
    status === "paid" ||
    status === "payment_intent.succeeded";

  if (!isSuccess) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const paymentReference = String(eventId ?? reference);

  // Idempotency: if this provider event/reference was already recorded, stop.
  const { data: existingPayment } = await supabase
    .from("fee_payments")
    .select("id, invoice_id")
    .eq("reference", paymentReference)
    .maybeSingle();

  if (existingPayment) {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  // Prefer invoice UUID match; also allow custom references already stored on payments.
  const { data: invoice } = await supabase
    .from("fee_invoices")
    .select("id, amount, amount_paid, status")
    .eq("id", reference)
    .maybeSingle();

  if (!invoice) {
    return NextResponse.json(
      { error: "Invoice not found for reference" },
      { status: 404 }
    );
  }

  const { error: insertError } = await supabase.from("fee_payments").insert({
    invoice_id: invoice.id,
    amount,
    method: "online",
    reference: paymentReference,
    paid_at: new Date().toISOString(),
  });

  if (insertError) {
    // Concurrent duplicate insert — treat as success.
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
    console.error("Payment webhook insert error:", insertError);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }

  const newAmountPaid = Number(invoice.amount_paid ?? 0) + amount;
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
    console.error("Payment webhook invoice update error:", updateError);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
