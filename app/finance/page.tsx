import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getBudgetPlans,
  getExpenseTotal,
  getFinanceKPIs,
  getPayrollTotals,
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

export default async function FinanceDashboard() {
  const t = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const role = normalizeRole(profile?.role);
  const workspace = getRoleWorkspace(role);
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };
  const showBudget = role !== "cashier" && Boolean(profile?.school_id);

  const [kpis, payrollTotals, operatingExpenses, currency, budgetPlans] =
    await Promise.all([
      getFinanceKPIs(scope),
      getPayrollTotals(scope),
      getExpenseTotal(scope),
      getSchoolCurrencyForSchool(profile?.school_id),
      showBudget && profile?.school_id
        ? getBudgetPlans(profile.school_id)
        : Promise.resolve([]),
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

  const metrics = isCashier
    ? [
        {
          label: t("feesCollected"),
          value: formatCurrency(kpis.collected),
          hint: t("collectedSub"),
        },
        {
          label: t("outstandingBalances"),
          value: formatCurrency(kpis.outstanding),
          hint: t("outstandingSub"),
          href: "/finance/outstanding",
        },
      ]
    : [
        {
          label: t("schoolFeesCollected"),
          value: formatCurrency(kpis.collected),
          hint: t("collectedSub"),
        },
        {
          label: t("outstandingSchoolFees"),
          value: formatCurrency(kpis.outstanding),
          hint: t("unpaidBalance"),
          href: "/finance/outstanding",
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
        {metrics.map((metric) => {
          const card = (
            <Card>
              <CardHeader>
                <CardTitle>{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm text-stone-500">{metric.hint}</p>
              </CardContent>
            </Card>
          );
          if ("href" in metric && metric.href) {
            return (
              <Link
                key={metric.label}
                href={metric.href}
                className="rounded-xl transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
              >
                {card}
              </Link>
            );
          }
          return <div key={metric.label}>{card}</div>;
        })}
      </div>

      {showBudget ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>{t("dashboardBudgetTitle")}</CardTitle>
              <p className="mt-1 text-sm text-stone-500">
                {t("dashboardBudgetSubtitle")}
              </p>
            </div>
            <Link href="/finance/budget">
              <Button size="sm" variant="outline">
                {t("viewAllBudgets")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {featuredBudget ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
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
                <Link href={`/finance/budget/${featuredBudget.id}`}>
                  <Button size="sm">{t("openBudgetPlan")}</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-500">
                  {t("dashboardBudgetEmpty")}
                </p>
                <Link href="/finance/budget">
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
