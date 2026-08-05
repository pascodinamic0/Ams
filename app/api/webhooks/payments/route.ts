import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { recordOnlinePayment } from "@/lib/payments/record-online-payment";

/**
 * Generic payment webhook for providers that send HMAC-SHA256 signatures
 * (Paystack-style adapters, custom gateways).
 *
 * For Stripe, use `/api/webhooks/stripe` instead.
 *
 * Expected payload:
 *   { reference: string, amount: number, status: string, event_id?: string }
 *
 * Environment:
 *   PAYMENT_WEBHOOK_SECRET
 *   SUPABASE_SERVICE_ROLE_KEY
 */

function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  // Stripe uses stripe-signature with t=/v1= format — reject here.
  if (signature.includes("t=") && signature.includes("v1=")) {
    console.error(
      "Stripe signature received on generic payment webhook; use /api/webhooks/stripe"
    );
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

  const result = await recordOnlinePayment({
    invoiceId: reference,
    amount,
    reference: String(eventId ?? reference),
    method: "online",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    received: true,
    duplicate: result.duplicate ?? false,
  });
}
