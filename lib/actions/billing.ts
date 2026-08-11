"use server";

import { revalidatePath } from "next/cache";
import { getAppOrigin } from "@/lib/auth/app-url";
import { hasPaidAccess } from "@/lib/billing/types";
import {
  getStripe,
  getStripePriceId,
  getStripeTrialDays,
  isStripeConfigured,
} from "@/lib/billing/stripe";
import { createClient } from "@/lib/supabase/server";
import { requireAdminClient } from "@/lib/supabase/admin";

const BILLING_MANAGER_ROLES = new Set([
  "academic_admin",
  "principal",
  "finance_officer",
  "accountant",
]);

async function requireBillingManager() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return { error: "No school linked to this account" as const };
  }

  const isManager =
    profile.role === "super_admin" ||
    BILLING_MANAGER_ROLES.has(profile.role ?? "");

  if (!isManager) {
    // School owner can also manage billing even if role differs.
    const { data: school } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", profile.school_id)
      .single();

    if (school?.owner_id !== user.id) {
      return {
        error: "Only school admins can manage billing for this school",
      } as const;
    }
  }

  return { user, schoolId: profile.school_id as string, role: profile.role as string };
}

export async function createBillingCheckoutSession(): Promise<{
  error?: string;
  url?: string;
}> {
  if (!isStripeConfigured()) {
    return {
      error:
        "Online billing is not configured yet. Contact ShuleOS support to activate your school.",
    };
  }

  const auth = await requireBillingManager();
  if ("error" in auth) return { error: auth.error };

  const supabase = await createClient();
  const { data: school } = await supabase
    .from("schools")
    .select(
      "id, name, contact_email, status, stripe_customer_id, subscription_status, billing_exempt"
    )
    .eq("id", auth.schoolId)
    .single();

  if (!school) return { error: "School not found" };
  if (school.status !== "approved") {
    return { error: "Your school must be approved before you can subscribe" };
  }
  if (hasPaidAccess(school)) {
    return { error: "This school already has access. Use Manage billing instead." };
  }

  const stripe = getStripe();
  const priceId = getStripePriceId();
  const origin = getAppOrigin();

  let customerId = school.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: school.contact_email || auth.user.email || undefined,
      name: school.name,
      metadata: { school_id: school.id },
    });
    customerId = customer.id;

    const adminResult = requireAdminClient();
    if ("error" in adminResult) return { error: adminResult.error };
    const { error } = await adminResult.client
      .from("schools")
      .update({
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", school.id);
    if (error) return { error: error.message };
  }

  const trialDays = getStripeTrialDays();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: school.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?canceled=1`,
    metadata: { school_id: school.id },
    subscription_data: {
      metadata: { school_id: school.id },
      ...(trialDays ? { trial_period_days: trialDays } : {}),
    },
  });

  if (!session.url) {
    return { error: "Could not create checkout session" };
  }

  return { url: session.url };
}

export async function createBillingPortalSession(): Promise<{
  error?: string;
  url?: string;
}> {
  if (!isStripeConfigured()) {
    return { error: "Online billing is not configured yet." };
  }

  const auth = await requireBillingManager();
  if ("error" in auth) return { error: auth.error };

  const supabase = await createClient();
  const { data: school } = await supabase
    .from("schools")
    .select("stripe_customer_id")
    .eq("id", auth.schoolId)
    .single();

  if (!school?.stripe_customer_id) {
    return { error: "No billing customer found. Start a subscription first." };
  }

  const stripe = getStripe();
  const origin = getAppOrigin();
  const portal = await stripe.billingPortal.sessions.create({
    customer: school.stripe_customer_id,
    return_url: `${origin}/billing`,
  });

  return { url: portal.url };
}

export async function setSchoolBillingExempt(
  schoolId: string,
  exempt: boolean
): Promise<{ error?: string; data?: { billing_exempt: boolean } }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { error: "Only platform administrators can change billing exemption" };
  }

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };

  const { error } = await adminResult.client
    .from("schools")
    .update({
      billing_exempt: exempt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", schoolId);

  if (error) return { error: error.message };

  revalidatePath("/admin/schools");
  revalidatePath(`/admin/schools/${schoolId}`);
  revalidatePath("/billing");
  return { data: { billing_exempt: exempt } };
}
