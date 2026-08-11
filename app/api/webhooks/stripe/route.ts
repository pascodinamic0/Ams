import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getStripe,
  getStripeWebhookSecret,
} from "@/lib/billing/stripe";
import {
  clearSchoolSubscription,
  findSchoolIdForStripeCustomer,
  findSchoolIdForStripeSubscription,
  syncSchoolSubscription,
} from "@/lib/billing/sync";

export const runtime = "nodejs";

async function resolveSchoolIdFromSubscription(
  subscription: Stripe.Subscription
): Promise<string | null> {
  const fromMeta = subscription.metadata?.school_id;
  if (fromMeta) return fromMeta;

  const bySub = await findSchoolIdForStripeSubscription(subscription.id);
  if (bySub) return bySub;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  return findSchoolIdForStripeCustomer(customerId);
}

export async function POST(request: NextRequest) {
  let stripe: ReturnType<typeof getStripe>;
  let webhookSecret: string;
  try {
    stripe = getStripe();
    webhookSecret = getStripeWebhookSecret();
  } catch (error) {
    console.error("Stripe webhook misconfigured:", error);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const schoolId =
          session.metadata?.school_id || session.client_reference_id || null;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!schoolId || !subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSchoolSubscription(schoolId, subscription);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const schoolId = await resolveSchoolIdFromSubscription(subscription);
        if (!schoolId) {
          console.warn(
            "Stripe subscription event without school mapping:",
            subscription.id
          );
          break;
        }
        await syncSchoolSubscription(schoolId, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const schoolId = await resolveSchoolIdFromSubscription(subscription);
        if (!schoolId) break;
        await clearSchoolSubscription(schoolId);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
