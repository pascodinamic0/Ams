import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getBudgetPlans,
  getExpenseTotal,
  getFinanceKPIs,
  getPayrollTotals,
  getPendingEnrollmentCount,
  getSchoolCurrencyForSchool,
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getRoleWorkspace } from "@/lib/auth/role-workspaces";
import { normalizeRole } from "@/lib/auth/rbac";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";
import {
  formatSchoolYear,
  getCurrentSchoolYearStart,
} from "@/lib/academic/school-year";

type FinanceMetric = {
  label: string;
  value: string;
  hint: string;
  href?: string;
};

function FinanceMetricCard({ metric }: { metric: FinanceMetric }) {
  const card = (
    <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-stone-50 dark:group-hover:bg-stone-900/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{metric.label}</span>
          {metric.href ? (
            <ChevronRight
              className="h-4 w-4 shrink-0 text-stone-400 group-hover:text-primary"
              aria-hidden
            />
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{metric.value}</p>
        <p className="text-sm text-stone-500">{metric.hint}</p>
      </CardContent>
    </Card>
  );

  if (!metric.href) {
    return <div>{card}</div>;
  }

  return (
    <Link
      href={metric.href}
      className="group rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
    >
      {card}
    </Link>
  );
}

export default async function FinanceDashboard() {
  const t = await getTranslations("finance");
  const tRoles = await getTranslations("roles");
  const profile = await getCurrentProfile();
  const role = normalizeRole(profile?.role);
  const workspace = getRoleWorkspace(role, tRoles);
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };
  const showBudget = role !== "cashier" && Boolean(profile?.school_id);

  const [kpis, payrollTotals, operatingExpenses, currency, budgetPlans, pendingEnrollments] =
    await Promise.all([
      getFinanceKPIs(scope),
      getPayrollTotals(scope),
      getExpenseTotal(scope),
      getSchoolCurrencyForSchool(profile?.school_id),
      showBudget && profile?.school_id
        ? getBudgetPlans(profile.school_id)
        : Promise.resolve([]),
      getPendingEnrollmentCount(scope),
    ]);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);
  const cashAvailable = kpis.collected - payrollTotals.paid - operatingExpenses;
  const isCashier = role === "cashier";

  const schoolYearStart = getCurrentSchoolYearStart();
  const featuredBudget =
    budgetPlans.find(
      (plan) => plan.status === "active" && plan.year === schoolYearStart
    ) ??
    budgetPlans.find((plan) => plan.status === "active") ??
    budgetPlans[0] ??
    null;

  const budgetStatusLabel =
    featuredBudget?.status === "active"
      ? t("budgetStatusActive")
      : featuredBudget?.status === "draft"
        ? t("budgetStatusDraft")
        : featuredBudget?.status === "archived"
          ? t("budgetStatusArchived")
          : "";

  const pendingEnrollmentMetric = {
    label: t("pendingEnrollmentsTitle"),
    value: String(pendingEnrollments),
    hint: t("pendingEnrollmentsHint"),
    href: "/finance/enrollments",
  };

  const metrics = isCashier
    ? [
        pendingEnrollmentMetric,
        {
          label: t("feesCollected"),
          value: formatCurrency(kpis.collected),
          hint: t("collectedSub"),
        },
        {
          label: t("outstandingBalances"),
          value: formatCurrency(kpis.outstanding),
          hint: t("outstandingSub"),
          href: "/finance/invoices",
        },
      ]
    : [
        pendingEnrollmentMetric,
        {
          label: t("schoolFeesCollected"),
          value: formatCurrency(kpis.collected),
          hint: t("collectedSub"),
        },
        {
          label: t("outstandingSchoolFees"),
          value: formatCurrency(kpis.outstanding),
          hint: t("unpaidBalance"),
          href: "/finance/invoices",
        },
        {
          label: t("payrollRequired"),
          value: formatCurrency(payrollTotals.total),
          hint: t("payrollDueHint"),
        },
        {
          label: t("payrollPaid"),
          value: formatCurrency(payrollTotals.paid),
          hint: t("paidSalariesHint"),
        },
        {
          label: t("operatingExpenses"),
          value: formatCurrency(operatingExpenses),
          hint: t("nonPayrollExpensesHint"),
        },
        {
          label: t("cashAvailable"),
          value: formatCurrency(cashAvailable),
          hint: t("cashAvailableHint"),
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {workspace.role === "finance_officer" ? t("title") : workspace.title}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{workspace.subtitle}</p>
        <p className="mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">
          {workspace.focusQuestion}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FinanceMetricCard metric={metrics[0]} />

        {!isCashier ? (
          <Link
            href="/finance/reports/activity/monthly"
            className="group rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Card className="h-full border-primary/25 bg-primary/[0.04] transition-colors group-hover:border-primary/50 group-hover:bg-primary/[0.08]">
              <CardHeader className="border-b-0 pb-0">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {t("activityReportTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-3">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {t("activityReportDashboardHint")}
                </p>
                <span className="inline-flex h-9 w-fit items-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm group-hover:bg-primary-hover">
                  {t("activityReportDashboardValue")}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </span>
              </CardContent>
            </Card>
          </Link>
        ) : null}

        {metrics.slice(1).map((metric) => (
          <FinanceMetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      {showBudget ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
            <div className="min-w-0 flex-1">
              <CardTitle>{t("dashboardBudgetTitle")}</CardTitle>
              <p className="mt-1 text-sm text-stone-500">
                {t("dashboardBudgetSubtitle")}
              </p>
            </div>
            <Link href="/finance/budget" className="shrink-0">
              <Button size="sm" variant="outline">
                {t("viewAllBudgets")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {featuredBudget ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-lg font-semibold text-stone-900 dark:text-white">
                    {featuredBudget.title}
                  </p>
                  <p className="text-sm text-stone-500">
                    {formatSchoolYear(featuredBudget.year)}
                    {featuredBudget.label ? ` · ${featuredBudget.label}` : ""}
                    {budgetStatusLabel ? ` · ${budgetStatusLabel}` : ""}
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(featuredBudget.total)}
                  </p>
                  <p className="text-sm text-stone-500">
                    {t("dashboardBudgetLines", {
                      count: featuredBudget.line_count,
                    })}
                  </p>
                </div>
                <Link href={`/finance/budget/${featuredBudget.id}`} className="shrink-0">
                  <Button size="sm">{t("openBudgetPlan")}</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-500">
                  {t("dashboardBudgetEmpty")}
                </p>
                <Link href="/finance/budget" className="shrink-0">
                  <Button size="sm">{t("createBudgetPlan")}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {workspace.quickActions.map((action) => (
            <Link key={action.href + action.label} href={action.href}>
              <Button size="sm" variant={action.variant ?? "primary"}>
                {action.label}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
