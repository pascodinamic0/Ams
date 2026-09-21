"use server";

import { actionError } from "@/lib/i18n/action-error";
import { getCurrentProfile } from "@/lib/auth/session";
import { canSharePaymentLinks, normalizeRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin } from "@/lib/auth/app-url";
import {
  buildPaymentLinkUrl,
  isValidPaymentToken,
} from "@/lib/payments/payment-links";

export async function ensureInvoicePaymentLink(invoiceId: string): Promise<
  { url: string; token: string } | { error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile) return await actionError("notAuthenticated");
  if (!canSharePaymentLinks(normalizeRole(profile.role))) {
    return await actionError("notAuthorized");
  }

  const supabase = await createClient();
  const { data: invoice, error } = await supabase
    .from("fee_invoices")
    .select("id, payment_token")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!invoice) return await actionError("invoiceNotFound");

  if (isValidPaymentToken(invoice.payment_token)) {
    return {
      token: invoice.payment_token,
      url: buildPaymentLinkUrl(getAppOrigin(), invoice.payment_token),
    };
  }

  const { data: minted, error: mintError } = await supabase.rpc(
    "generate_invoice_payment_token"
  );
  const token =
    typeof minted === "string" && isValidPaymentToken(minted)
      ? minted
      : null;

  if (mintError || !token) {
    return { error: mintError?.message ?? "Could not create a payment link" };
  }

  const { error: updateError } = await supabase
    .from("fee_invoices")
    .update({ payment_token: token, updated_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (updateError) return { error: updateError.message };

  return {
    token,
    url: buildPaymentLinkUrl(getAppOrigin(), token),
  };
}
