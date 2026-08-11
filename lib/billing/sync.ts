import type Stripe from "stripe";
import { requireAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "./types";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const known: Record<string, SubscriptionStatus> = {
    trialing: "trialing",
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    incomplete: "incomplete",
    incomplete_expired: "incomplete_expired",
    paused: "paused",
  };
  return known[status] ?? "none";
}

function periodEndIso(subscription: Stripe.Subscription): string | null {
  const end = subscription.items.data[0]?.current_period_end ?? null;
  if (!end) return null;
  return new Date(end * 1000).toISOString();
}

function trialEndIso(subscription: Stripe.Subscription): string | null {
  if (!subscription.trial_end) return null;
  return new Date(subscription.trial_end * 1000).toISOString();
}

export async function syncSchoolSubscription(
  schoolId: string,
  subscription: Stripe.Subscription
) {
  const adminResult = requireAdminClient();
  if ("error" in adminResult) {
    throw new Error(adminResult.error);
  }

  const priceId =
    typeof subscription.items.data[0]?.price === "string"
      ? subscription.items.data[0]?.price
      : subscription.items.data[0]?.price?.id ?? null;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const { error } = await adminResult.client
    .from("schools")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: mapStripeStatus(subscription.status),
      subscription_price_id: priceId,
      trial_ends_at: trialEndIso(subscription),
      current_period_end: periodEndIso(subscription),
      updated_at: new Date().toISOString(),
    })
    .eq("id", schoolId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearSchoolSubscription(schoolId: string) {
  const adminResult = requireAdminClient();
  if ("error" in adminResult) {
    throw new Error(adminResult.error);
  }

  const { error } = await adminResult.client
    .from("schools")
    .update({
      stripe_subscription_id: null,
      subscription_status: "canceled",
      subscription_price_id: null,
      trial_ends_at: null,
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", schoolId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function findSchoolIdForStripeCustomer(
  customerId: string
): Promise<string | null> {
  const adminResult = requireAdminClient();
  if ("error" in adminResult) return null;

  const { data } = await adminResult.client
    .from("schools")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.id ?? null;
}

export async function findSchoolIdForStripeSubscription(
  subscriptionId: string
): Promise<string | null> {
  const adminResult = requireAdminClient();
  if ("error" in adminResult) return null;

  const { data } = await adminResult.client
    .from("schools")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  return data?.id ?? null;
}
