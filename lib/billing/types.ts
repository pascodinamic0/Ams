export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

/** Fixed ShuleOS school plan amount (USD). Stripe Price ID must match this. */
export const SHULEOS_PLAN_AMOUNT_USD = 350;

export type SchoolBillingFields = {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_price_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  billing_exempt: boolean;
};

/** Statuses that unlock the product for a school. */
export const PAID_SUBSCRIPTION_STATUSES: readonly SubscriptionStatus[] = [
  "active",
  "trialing",
];

export function hasPaidAccess(fields: {
  billing_exempt?: boolean | null;
  subscription_status?: SubscriptionStatus | string | null;
}): boolean {
  if (fields.billing_exempt) return true;
  const status = fields.subscription_status ?? "none";
  return PAID_SUBSCRIPTION_STATUSES.includes(status as SubscriptionStatus);
}
