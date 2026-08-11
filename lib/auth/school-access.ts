import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import { hasPaidAccess, type SubscriptionStatus } from "@/lib/billing/types";
import { normalizeRole, type UserRole } from "./rbac";

export type SchoolAccessContext = {
  role: UserRole;
  schoolId: string | null;
  schoolStatus: "pending" | "approved" | "suspended" | null;
  billingExempt: boolean;
  subscriptionStatus: SubscriptionStatus | null;
};

function isApprovalHoldPath(pathname: string): boolean {
  return (
    pathname === "/pending" ||
    pathname === "/billing" ||
    pathname.startsWith("/billing/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    pathname.startsWith("/settings") ||
    pathname === "/login"
  );
}

/**
 * While waiting to pay, keep them on billing — not the product or structure wizard.
 * Profile onboarding (/onboarding only) must stay reachable so invite → password →
 * onboarding does not bounce against /billing.
 */
function isBillingHoldPath(pathname: string): boolean {
  return (
    pathname === "/billing" ||
    pathname.startsWith("/billing/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/settings") ||
    pathname === "/login"
  );
}

export async function getSchoolAccessContext(
  request: NextRequest,
  userId: string
): Promise<SchoolAccessContext | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", userId)
    .single();

  if (!profile?.role) return null;

  const role = normalizeRole(profile.role);
  let schoolStatus: SchoolAccessContext["schoolStatus"] = null;
  let billingExempt = false;
  let subscriptionStatus: SubscriptionStatus | null = null;

  if (profile.school_id) {
    const { data: school } = await supabase
      .from("schools")
      .select("status, billing_exempt, subscription_status")
      .eq("id", profile.school_id)
      .single();
    schoolStatus = (school?.status as SchoolAccessContext["schoolStatus"]) ?? null;
    billingExempt = Boolean(school?.billing_exempt);
    subscriptionStatus =
      (school?.subscription_status as SubscriptionStatus | null) ?? "none";
  }

  return {
    role,
    schoolId: profile.school_id,
    schoolStatus,
    billingExempt,
    subscriptionStatus,
  };
}

export function schoolHasProductAccess(
  ctx: Pick<
    SchoolAccessContext,
    "schoolStatus" | "billingExempt" | "subscriptionStatus"
  >
): boolean {
  if (ctx.schoolStatus !== "approved") return false;
  return hasPaidAccess({
    billing_exempt: ctx.billingExempt,
    subscription_status: ctx.subscriptionStatus,
  });
}

/** Where to send users when the school portal is blocked. */
export function schoolPortalBlockDestination(
  ctx: Pick<
    SchoolAccessContext,
    "schoolStatus" | "billingExempt" | "subscriptionStatus"
  >
): "/pending" | "/billing" {
  if (ctx.schoolStatus === "approved" && !schoolHasProductAccess(ctx)) {
    return "/billing";
  }
  return "/pending";
}

export function schoolPortalBlocked(
  ctx: Pick<
    SchoolAccessContext,
    "role" | "schoolId" | "schoolStatus" | "billingExempt" | "subscriptionStatus"
  >,
  pathname: string
): boolean {
  if (ctx.role === "super_admin") return false;
  if (!ctx.schoolId || !ctx.schoolStatus) return false;

  if (ctx.schoolStatus !== "approved") {
    return !isApprovalHoldPath(pathname);
  }

  if (!schoolHasProductAccess(ctx)) {
    return !isBillingHoldPath(pathname);
  }

  return false;
}
