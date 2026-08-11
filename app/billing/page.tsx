import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import {
  ManageBillingButton,
  SubscribeButton,
  BillingStatusToasts,
} from "./billing-actions";
import { Button } from "@/components/ui/button";
import { getDashboardForRole } from "@/lib/auth/rbac";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  hasPaidAccess,
  SHULEOS_PLAN_AMOUNT_USD,
  type SubscriptionStatus,
} from "@/lib/billing/types";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { createClient } from "@/lib/supabase/server";

const BILLING_MANAGER_ROLES = new Set([
  "academic_admin",
  "principal",
  "finance_officer",
  "accountant",
  "super_admin",
]);

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const t = await getTranslations("billing");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "super_admin") redirect("/admin");
  if (!profile.school_id) redirect("/register/complete");

  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: school } = await supabase
    .from("schools")
    .select(
      "id, name, status, owner_id, billing_exempt, subscription_status, trial_ends_at, current_period_end, stripe_customer_id"
    )
    .eq("id", profile.school_id)
    .single();

  if (!school) redirect("/pending");
  if (school.status !== "approved") redirect("/pending");

  const subscriptionStatus =
    (school.subscription_status as SubscriptionStatus) ?? "none";
  const paid = hasPaidAccess(school);
  const canManage =
    BILLING_MANAGER_ROLES.has(profile.role) || school.owner_id === user?.id;
  const stripeReady = isStripeConfigured();
  const dashboardHref = getDashboardForRole(profile.role);

  const title = school.billing_exempt
    ? t("exemptTitle")
    : paid
      ? t("activeTitle")
      : t("lockedTitle");
  const subtitle = school.billing_exempt
    ? t("exemptSubtitle")
    : paid
      ? t("activeSubtitle")
      : t("lockedSubtitle");

  const statusKey = school.billing_exempt
    ? "exempt"
    : (subscriptionStatus as string);

  return (
    <div className="marketing-surface flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <BillingStatusToasts
        success={params.success === "1"}
        canceled={params.canceled === "1"}
      />
      <div className="w-full max-w-lg space-y-6 border border-mkt-ink/10 p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mkt-ink/50">
            {t("schoolLabel")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-mkt-ink">
            {school.name}
          </h1>
          <p className="mt-3 text-sm text-mkt-ink/60">{subtitle}</p>
        </div>

        <div className="space-y-2 border-t border-mkt-ink/10 pt-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-mkt-ink/50">{t("planLabel")}</span>
            <span className="font-medium text-mkt-ink">
              {t("planPrice", { amount: SHULEOS_PLAN_AMOUNT_USD })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-mkt-ink/50">{t("statusLabel")}</span>
            <span className="font-medium text-mkt-ink">
              {t(`status.${statusKey}` as "status.active")}
            </span>
          </div>
          {school.trial_ends_at && subscriptionStatus === "trialing" && (
            <p className="text-mkt-ink/50">
              {t("trialEnds", {
                date: format(new Date(school.trial_ends_at), "MMM d, yyyy"),
              })}
            </p>
          )}
          {school.current_period_end && paid && !school.billing_exempt && (
            <p className="text-mkt-ink/50">
              {t("periodEnd", {
                date: format(new Date(school.current_period_end), "MMM d, yyyy"),
              })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {!paid && (
            <>
              {canManage && stripeReady ? (
                <SubscribeButton />
              ) : (
                <p className="text-sm text-mkt-ink/60">
                  {!stripeReady ? t("notConfigured") : t("notManager")}
                </p>
              )}
            </>
          )}
          {paid && !school.billing_exempt && school.stripe_customer_id && canManage && (
            <ManageBillingButton />
          )}
          {paid && (
            <Link href={dashboardHref}>
              <Button variant="outline">{t("goToDashboard")}</Button>
            </Link>
          )}
        </div>

        <p className="text-xs text-mkt-ink/40">{t("title")}</p>
      </div>
    </div>
  );
}
