"use server";

import { randomBytes } from "node:crypto";
import { getAppOrigin } from "@/lib/auth/app-url";
import { createClient } from "@/lib/supabase/server";
import { getSchoolCurrency } from "@/lib/currency";
import { toStripeUnitAmount } from "@/lib/stripe/money";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";

export async function createFeeCheckoutSession(
  invoiceId: string
): Promise<{ url?: string; error?: string }> {
  if (!isStripeConfigured()) {
    return {
      error: "Online card payment is not configured yet. Use the manual payment steps below.",
    };
  }

  if (!invoiceId) return { error: "Invoice is required" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: guardian } = await supabase
    .from("guardians")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!guardian) return { error: "No guardian profile linked to this account" };

  const { data: invoice } = await supabase
    .from("fee_invoices")
    .select(
      "id, amount, amount_paid, description, due_date, student_id, students(id, first_name, last_name, student_id, school_id)"
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (!invoice) return { error: "Invoice not found" };

  const studentJoin = invoice.students as
    | {
        id: string;
        first_name: string;
        last_name: string;
        student_id: string | null;
        school_id: string;
      }
    | {
        id: string;
        first_name: string;
        last_name: string;
        student_id: string | null;
        school_id: string;
      }[]
    | null;
  const student = Array.isArray(studentJoin) ? studentJoin[0] ?? null : studentJoin;

  if (!student?.id) return { error: "Invoice student not found" };

  const { data: link } = await supabase
    .from("guardian_students")
    .select("student_id")
    .eq("guardian_id", guardian.id)
    .eq("student_id", student.id)
    .maybeSingle();

  if (!link) return { error: "You can only pay invoices for your linked students" };

  const amount = Number(invoice.amount);
  const amountPaid = Number(invoice.amount_paid ?? 0);
  const balance = Math.max(0, amount - amountPaid);
  if (balance <= 0) return { error: "This invoice is already fully paid" };

  const { data: school } = await supabase
    .from("schools")
    .select("name, currency_code")
    .eq("id", student.school_id)
    .maybeSingle();

  const currency = getSchoolCurrency(school?.currency_code);
  const unitAmount = toStripeUnitAmount(balance, currency.code);
  const studentName = `${student.first_name} ${student.last_name}`.trim();
  const productName = invoice.description?.trim() || "School fees";
  const origin = getAppOrigin();
  const suffix = randomBytes(4).toString("hex");

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: invoice.id,
      customer_email: user.email ?? undefined,
      success_url: `${origin}/parent/pay?invoice=${invoice.id}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/parent/pay?invoice=${invoice.id}&checkout=cancel`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.code.toLowerCase(),
            unit_amount: unitAmount,
            product_data: {
              name: productName,
              description: [
                school?.name,
                studentName,
                student.student_id ? `ID ${student.student_id}` : null,
                invoice.due_date ? `Due ${invoice.due_date}` : null,
              ]
                .filter(Boolean)
                .join(" · "),
            },
          },
        },
      ],
      metadata: {
        invoice_id: invoice.id,
        student_id: student.id,
        school_id: student.school_id,
        guardian_id: guardian.id,
        balance: String(balance),
        currency: currency.code,
      },
      payment_intent_data: {
        metadata: {
          invoice_id: invoice.id,
          student_id: student.id,
          school_id: student.school_id,
        },
      },
      integration_identifier: `shuleos_fee_checkout_${suffix}`,
    });

    if (!session.url) {
      return { error: "Stripe did not return a checkout URL" };
    }

    return { url: session.url };
  } catch (error) {
    console.error("createFeeCheckoutSession error:", error);
    const message =
      error instanceof Error ? error.message : "Could not start Stripe Checkout";
    return { error: message };
  }
}
