/**
 * Stripe amounts are in the currency's smallest unit.
 * Our school currencies all use two decimal places (none are zero-decimal).
 * See https://docs.stripe.com/currencies#zero-decimal
 */
const ZERO_DECIMAL = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export function toStripeUnitAmount(
  amount: number,
  currencyCode: string
): number {
  const code = currencyCode.toUpperCase();
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  if (ZERO_DECIMAL.has(code)) {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
}

export function fromStripeUnitAmount(
  unitAmount: number,
  currencyCode: string
): number {
  const code = currencyCode.toUpperCase();
  if (ZERO_DECIMAL.has(code)) {
    return unitAmount;
  }
  return unitAmount / 100;
}
