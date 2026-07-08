import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Chart } from "@/components/ui/chart";
import { ExportButton } from "@/components/ui/export-button";
import {
  getFinanceKPIs,
  getInvoices,
  getMonthlyPaymentTotals,
  getMonthlyExpenseTotals,
  getMonthlyPayrollTotals,
  getExpenseTotal,
  getPayrollTotals,
  getExpensesByCategory,
  getSchoolCurrencyForSchool,
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";

function lastMonths(count: number): string[] {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function monthLabel(ym: string) {
  const [year, month] = ym.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export default async function FinancialReportsPage() {
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const [
    kpis,
    invoices,
    revenueByMonth,
    expensesByMonth,
    payrollByMonth,
    expenseTotal,
    payrollTotals,
    expensesByCategory,
    currency,
  ] = await Promise.all([
    getFinanceKPIs(scope),
    getInvoices(scope),
    getMonthlyPaymentTotals(scope),
    getMonthlyExpenseTotals(scope),
    getMonthlyPayrollTotals(scope),
    getExpenseTotal(scope),
    getPayrollTotals(scope),
    getExpensesByCategory(scope),
    getSchoolCurrencyForSchool(profile?.school_id),
  ]);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);

  const months = lastMonths(6);
  const trendData = months.map((month) => ({
    month: monthLabel(month),
    revenue: revenueByMonth[month] ?? 0,
    expenses: (expensesByMonth[month] ?? 0) + (payrollByMonth[month] ?? 0),
  }));

  const feeStatusBreakdown = [
    { name: t("statusPaid"), value: invoices.filter((i) => i.status === "paid").length },
    {
      name: t("statusPending"),
      value: invoices.filter((i) => i.status === "pending" && i.balance > 0).length,
    },
    {
      name: tc("overdue"),
      value: invoices.filter(
        (i) =>
          i.balance > 0 &&
          (i.status === "overdue" ||
            (i.status === "pending" && new Date(i.due_date) < new Date(new Date().toDateString())))
      ).length,
    },
  ].filter((row) => row.value > 0);

  const breakdownRows = trendData.map((row) => ({
    month: row.month,
    revenue: row.revenue,
    expenses: row.expenses,
    net: row.revenue - row.expenses,
  }));

  const netPosition = kpis.collected - expenseTotal - payrollTotals.paid;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("reportsTitle")}</h1>
        <ExportButton
          data={breakdownRows}
          columns={[
            { key: "month", label: t("colMonth") },
            { key: "revenue", label: t("colRevenue") },
            { key: "expenses", label: t("colExpenses") },
            { key: "net", label: t("colNet") },
          ]}
          filename="financial-report"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>{t("collected")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.collected)}</p>
            <p className="text-sm text-stone-500">{t("collectedFeesSub")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("outstanding")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.outstanding)}</p>
            <p className="text-sm text-stone-500">{t("outstandingInvoiceSub")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("expensesTitle")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(expenseTotal)}</p>
            <p className="text-sm text-stone-500">{t("expensesSub")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("netPosition")}</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netPosition >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netPosition)}
            </p>
            <p className="text-sm text-stone-500">{t("netPositionSub")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={trendData}
          type="line"
          xKey="month"
          yKeys={["revenue", "expenses"]}
          title={t("chartRevenueVsExpenses")}
          height={320}
        />
        {feeStatusBreakdown.length > 0 ? (
          <Chart
            data={feeStatusBreakdown}
            type="pie"
            nameKey="name"
            dataKey="value"
            title={t("chartInvoiceStatus")}
            height={320}
          />
        ) : (
          <Card>
            <CardHeader><CardTitle>{t("chartInvoiceStatus")}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-stone-500">{t("noInvoiceChartData")}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={trendData}
          type="bar"
          xKey="month"
          yKeys={["revenue", "expenses"]}
          title={t("chartMonthlyCollection")}
          height={320}
        />
        {expensesByCategory.length > 0 ? (
          <Chart
            data={expensesByCategory}
            type="pie"
            nameKey="name"
            dataKey="value"
            title={t("chartExpensesByCategory")}
            height={320}
          />
        ) : (
          <Card>
            <CardHeader><CardTitle>{t("chartExpensesByCategory")}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-stone-500">{t("noExpensesChartData")}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">{t("monthlyBreakdown")}</h2>
        <DataTable
          data={breakdownRows}
          keyField="month"
          columns={[
            { id: "month", header: t("colMonth"), accessorKey: "month", sortable: true },
            { id: "revenue", header: t("colRevenue"), accessorKey: "revenue", sortable: true },
            { id: "expenses", header: t("colExpenses"), accessorKey: "expenses", sortable: true },
            { id: "net", header: t("colNet"), accessorKey: "net", sortable: true },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>{tc("overdue")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(kpis.overdue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("payrollPendingKpi")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(payrollTotals.pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("invoicesKpi")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.invoiceCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
