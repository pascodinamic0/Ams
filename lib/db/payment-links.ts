import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isValidPaymentToken } from "@/lib/payments/payment-links";

export type PublicInvoicePayment = {
  invoice_id: string;
  invoice_ref: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  status: string;
  description: string | null;
  student_name: string;
  student_code: string | null;
  school_name: string;
  school_locale: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  currency_code: string | null;
};

type RpcRow = {
  invoice_id: string;
  invoice_ref: string;
  amount: number | string;
  amount_paid: number | string;
  due_date: string;
  status: string;
  description: string | null;
  student_name: string | null;
  student_code: string | null;
  school_name: string | null;
  school_locale: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  currency_code: string | null;
};

export const getPublicInvoicePayment = cache(async (
  token: string
): Promise<PublicInvoicePayment | null> => {
  if (!isValidPaymentToken(token)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_invoice_payment", {
    p_token: token.trim(),
  });

  if (error) {
    console.error("getPublicInvoicePayment error:", error);
    return null;
  }

  const row = Array.isArray(data) ? (data[0] as RpcRow | undefined) : (data as RpcRow | null);
  if (!row?.invoice_id) return null;

  return {
    invoice_id: row.invoice_id,
    invoice_ref: row.invoice_ref,
    amount: Number(row.amount),
    amount_paid: Number(row.amount_paid ?? 0),
    due_date: row.due_date,
    status: row.status,
    description: row.description,
    student_name: row.student_name?.trim() || "-",
    student_code: row.student_code,
    school_name: row.school_name?.trim() || "-",
    school_locale: row.school_locale,
    contact_email: row.contact_email,
    contact_phone: row.contact_phone,
    address: row.address,
    currency_code: row.currency_code,
  };
});
