import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { resolveLoginDestination } from "@/lib/auth/login-redirect";
import { userMustSetPassword } from "@/lib/auth/password-setup";
import { shouldNeedStructureSetup } from "@/lib/auth/structure-setup";
import { hasPaidAccess, type SubscriptionStatus } from "@/lib/billing/types";

type SchoolStatus = "pending" | "approved" | "suspended" | null;

/** Password setup must run before onboarding (invites + recovery emails). */
function isPasswordSetupRedirect(redirect?: string | null): boolean {
  if (!redirect) return false;
  return redirect === "/reset-password" || redirect.startsWith("/reset-password?");
}

export async function getPostAuthRedirect(options: {
  userId: string;
  redirect?: string | null;
  intent?: string | null;
  user?: User | null;
}): Promise<string> {
  // Invited users and password-recovery links must set a password first.
  // Previously onboarding ran first and skipped /reset-password entirely.
  if (options.intent === "invite" || isPasswordSetupRedirect(options.redirect)) {
    return isPasswordSetupRedirect(options.redirect)
      ? (options.redirect as string)
      : "/reset-password";
  }

  const supabase = await createClient();
  const user =
    options.user ??
    (
      await supabase.auth.getUser()
    ).data.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      role,
      school_id,
      onboarding_completed_at,
      password_setup_required,
      schools(
        status,
        structure_setup_completed_at,
        billing_exempt,
        subscription_status
      )
    `
    )
    .eq("id", options.userId)
    .single();

  if (userMustSetPassword(user) || profile?.password_setup_required) {
    return "/reset-password";
  }

  const role = profile?.role ?? null;
  const needsSchool =
    role !== "super_admin" && !profile?.school_id;

  if (needsSchool || options.intent === "register") {
    const { data: ownedSchool } = await supabase
      .from("schools")
      .select("id")
      .eq("owner_id", options.userId)
      .maybeSingle();

    if (!ownedSchool && !profile?.school_id) {
      return "/register/complete";
    }
  }

  if (!profile?.onboarding_completed_at) {
    return "/onboarding";
  }

  const school = (Array.isArray(profile?.schools)
    ? profile.schools[0]
    : profile?.schools) as {
    status?: SchoolStatus;
    structure_setup_completed_at?: string | null;
    billing_exempt?: boolean | null;
    subscription_status?: SubscriptionStatus | null;
  } | null;
  const schoolStatus = school?.status ?? null;
  const structureSetupCompletedAt = school?.structure_setup_completed_at ?? null;
  const billingExempt = Boolean(school?.billing_exempt);
  const subscriptionStatus = school
    ? (school.subscription_status ?? "none")
    : null;

  const paid = hasPaidAccess({
    billing_exempt: billingExempt,
    subscription_status: subscriptionStatus,
  });

  // Collect payment before structure setup so unpaid schools don't configure first.
  if (schoolStatus === "approved" && !paid) {
    return "/billing";
  }

  if (
    shouldNeedStructureSetup({
      role,
      schoolStatus,
      structureSetupCompletedAt,
    })
  ) {
    return "/onboarding/school";
  }

  return resolveLoginDestination({
    role,
    schoolStatus,
    billingExempt,
    subscriptionStatus,
    redirect: options.redirect,
  });
}
