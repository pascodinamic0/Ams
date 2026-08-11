"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { resolveLoginDestination } from "@/lib/auth/login-redirect";
import { shouldNeedStructureSetup } from "@/lib/auth/structure-setup";
import type { SubscriptionStatus } from "@/lib/billing/types";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(120, "Name is too long");

async function requireAuthenticatedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, avatar_url, onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (!profile?.role) return { error: "Profile not found" as const };

  return { supabase, user, profile };
}

export async function updateProfileName(name: string) {
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid name" };
  }

  const auth = await requireAuthenticatedProfile();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase
    .from("profiles")
    .update({
      name: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id);

  if (error) return { error: error.message };

  revalidatePath("/onboarding");
  return { data: { name: parsed.data } };
}

export async function completeProfileOnboarding() {
  const auth = await requireAuthenticatedProfile();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase
    .from("profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id);

  if (error) return { error: error.message };

  let schoolStatus: "pending" | "approved" | "suspended" | null = null;
  let structureSetupCompletedAt: string | null = null;
  let billingExempt = false;
  let subscriptionStatus: SubscriptionStatus | null = null;
  if (auth.profile.school_id) {
    const { data: school } = await auth.supabase
      .from("schools")
      .select(
        "status, structure_setup_completed_at, billing_exempt, subscription_status"
      )
      .eq("id", auth.profile.school_id)
      .single();
    schoolStatus = (school?.status as typeof schoolStatus) ?? null;
    structureSetupCompletedAt = school?.structure_setup_completed_at ?? null;
    billingExempt = Boolean(school?.billing_exempt);
    subscriptionStatus =
      (school?.subscription_status as SubscriptionStatus | null) ?? "none";
  }

  // Match post-auth / proxy order: pay before structure setup.
  const destination = resolveLoginDestination({
    role: auth.profile.role,
    schoolStatus,
    billingExempt,
    subscriptionStatus,
  });

  const next =
    destination === "/billing" || destination === "/pending"
      ? destination
      : shouldNeedStructureSetup({
            role: auth.profile.role,
            schoolStatus,
            structureSetupCompletedAt,
          })
        ? "/onboarding/school"
        : destination;

  revalidatePath("/", "layout");
  return { data: { destination: next } };
}
