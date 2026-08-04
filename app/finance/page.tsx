import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getExpenseTotal, getFinanceKPIs, getPayrollTotals, getSchoolCurrencyForSchool } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getRoleWorkspace } from "@/lib/auth/role-workspaces";
import { normalizeRole } from "@/lib/auth/rbac";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";

export default async function FinanceDashboard() {
  const t = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const role = normalizeRole(profile?.role);
  const workspace = getRoleWorkspace(role);
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };
  const [kpis, payrollTotals, operatingExpenses, currency] = await Promise.all([
    getFinanceKPIs(scope),
    getPayrollTotals(scope),
    getExpenseTotal(scope),
    getSchoolCurrencyForSchool(profile?.school_id),
  ]);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);
  const cashAvailable = kpis.collected - payrollTotals.paid - operatingExpenses;
  const isCashier = role === "cashier";

  const metrics = isCashier
    ? [
        {
          label: "Fees collected",
          value: formatCurrency(kpis.collected),
          hint: "Total received",
        },
        {
          label: "Outstanding balances",
          value: formatCurrency(kpis.outstanding),
          hint: "Still to collect",
        },
      ]
    : [
        {
          label: "School Fees Collected",
          value: formatCurrency(kpis.collected),
          hint: "Total received",
        },
        {
          label: "Outstanding School Fees",
          value: formatCurrency(kpis.outstanding),
          hint: "Unpaid balance",
        },
        {
          label: "Payroll Required",
          value: formatCurrency(payrollTotals.total),
          hint: "Total payroll due",
        },
        {
          label: "Payroll Paid",
          value: formatCurrency(payrollTotals.paid),
          hint: "Paid salaries",
        },
        {
          label: "Operating Expenses",
          value: formatCurrency(operatingExpenses),
          hint: "Non-payroll expenses",
        },
        {
          label: "Cash Available",
          value: formatCurrency(cashAvailable),
          hint: "Fees collected - payroll paid - operating expenses",
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
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle>{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className="text-sm text-stone-500">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
