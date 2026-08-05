import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { recordOnlinePayment } from "@/lib/payments/record-online-payment";
import { fromStripeUnitAmount } from "@/lib/stripe/money";
import { getStripe, isStripeWebhookConfigured } from "@/lib/stripe/server";

export const runtime = "nodejs";

async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode !== "payment") {
    return NextResponse.json({ received: true, ignored: "mode" });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, ignored: "unpaid" });
  }

  const invoiceId =
    session.metadata?.invoice_id || session.client_reference_id || null;
  if (!invoiceId) {
    console.error("Stripe webhook: missing invoice_id on session", session.id);
    return NextResponse.json(
      { error: "Missing invoice_id metadata" },
      { status: 400 }
    );
  }

  const currency = (session.currency ?? "usd").toUpperCase();
  const unitAmount = session.amount_total ?? 0;
  if (unitAmount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const amount = fromStripeUnitAmount(unitAmount, currency);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const reference = paymentIntentId || session.id;

  const result = await recordOnlinePayment({
    invoiceId,
    amount,
    reference,
    method: "online",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    received: true,
    duplicate: result.duplicate ?? false,
    invoiceId: result.invoiceId,
    status: result.status,
  });
}

export async function POST(request: NextRequest) {
  if (!isStripeWebhookConfigured()) {
    console.error("Stripe webhook not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!.trim();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        return await fulfillCheckoutSession(
          event.data.object as Stripe.Checkout.Session
        );
      case "checkout.session.async_payment_failed":
        return NextResponse.json({ received: true, ignored: "failed" });
      default:
        return NextResponse.json({ received: true, ignored: event.type });
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
