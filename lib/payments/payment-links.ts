const TOKEN_PATTERN = /^[a-f0-9]{32,64}$/i;

export const PAYMENT_LINK_PATH_PREFIX = "/pay";

export function isValidPaymentToken(token: string | null | undefined): token is string {
  if (!token) return false;
  return TOKEN_PATTERN.test(token.trim());
}

export function paymentLinkPath(token: string): string {
  return `${PAYMENT_LINK_PATH_PREFIX}/${token.trim()}`;
}

export function buildPaymentLinkUrl(origin: string, token: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${paymentLinkPath(token)}`;
}

/** If a reminder template forgot {pay_link}, still put the URL on the message. */
export function appendPayLinkIfMissing(message: string, payLink: string): string {
  if (!payLink) return message;
  if (message.includes(payLink)) return message;
  return `${message.trim()}\n\n${payLink}`;
}

export function invoicePublicRef(invoiceId: string): string {
  return invoiceId.replace(/-/g, "").slice(0, 8).toUpperCase();
}
