import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/** True when secret key is present (Checkout can be created). */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** True when secret + webhook secret are both set. */
export function isStripeWebhookConfigured(): boolean {
  return (
    isStripeConfigured() && Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim())
  );
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
      appInfo: {
        name: "ShuleOS",
        version: "0.1.0",
        url: "https://github.com/pascodinamic0/Ams",
      },
    });
  }

  return stripeClient;
}
