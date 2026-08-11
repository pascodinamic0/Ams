import { hasPaidAccess, type SubscriptionStatus } from "@/lib/billing/types";
import { canAccessPath, getDashboardForRole, normalizeRole } from "./rbac";

type SchoolStatus = "pending" | "approved" | "suspended" | null;

export function resolveLoginDestination(options: {
  role: string | null | undefined;
  schoolStatus: SchoolStatus;
  billingExempt?: boolean | null;
  subscriptionStatus?: SubscriptionStatus | string | null;
  redirect?: string | null;
}): string {
  const {
    role,
    schoolStatus,
    billingExempt,
    subscriptionStatus,
    redirect,
  } = options;
  const normalizedRole = normalizeRole(role);

  if (schoolStatus === "pending" || schoolStatus === "suspended") {
    return "/pending";
  }

  if (
    schoolStatus === "approved" &&
    !hasPaidAccess({
      billing_exempt: billingExempt,
      subscription_status: subscriptionStatus,
    })
  ) {
    return "/billing";
  }

  const roleDashboard = getDashboardForRole(normalizedRole);

  if (!redirect) {
    return roleDashboard;
  }

  // Public school sites are not dashboards; always send users to their role home.
  if (redirect === "/schools" || redirect.startsWith("/schools/")) {
    return roleDashboard;
  }

  if (canAccessPath(normalizedRole, redirect)) {
    return redirect;
  }

  return roleDashboard;
}
