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
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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
  ] = await Promise.all([
    getFinanceKPIs(scope),
    getInvoices(scope),
    getMonthlyPaymentTotals(scope),
    getMonthlyExpenseTotals(scope),
    getMonthlyPayrollTotals(scope),
    getExpenseTotal(scope),
    getPayrollTotals(scope),
    getExpensesByCategory(scope),
  ]);

  const months = lastMonths(6);
  const trendData = months.map((month) => ({
    month: monthLabel(month),
    revenue: revenueByMonth[month] ?? 0,
    expenses: (expensesByMonth[month] ?? 0) + (payrollByMonth[month] ?? 0),
  }));

  const feeStatusBreakdown = [
    { name: "Paid", value: invoices.filter((i) => i.status === "paid").length },
    {
      name: "Pending",
      value: invoices.filter((i) => i.status === "pending" && i.balance > 0).length,
    },
    {
      name: "Overdue",
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
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <ExportButton
          data={breakdownRows}
          columns={[
            { key: "month", label: "Month" },
            { key: "revenue", label: "Revenue" },
            { key: "expenses", label: "Expenses" },
            { key: "net", label: "Net" },
          ]}
          filename="financial-report"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Collected</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.collected)}</p>
            <p className="text-sm text-slate-500">Fee payments received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Outstanding</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.outstanding)}</p>
            <p className="text-sm text-slate-500">Unpaid invoice balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(expenseTotal)}</p>
            <p className="text-sm text-slate-500">Recorded spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Net position</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netPosition >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netPosition)}
            </p>
            <p className="text-sm text-slate-500">Collected minus costs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={trendData}
          type="line"
          xKey="month"
          yKeys={["revenue", "expenses"]}
          title="Revenue vs expenses (last 6 months)"
          height={320}
        />
        {feeStatusBreakdown.length > 0 ? (
          <Chart
            data={feeStatusBreakdown}
            type="pie"
            nameKey="name"
            dataKey="value"
            title="Invoice status breakdown"
            height={320}
          />
        ) : (
          <Card>
            <CardHeader><CardTitle>Invoice status breakdown</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">No invoice data to chart yet.</p>
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
          title="Monthly collection vs costs"
          height={320}
        />
        {expensesByCategory.length > 0 ? (
          <Chart
            data={expensesByCategory}
            type="pie"
            nameKey="name"
            dataKey="value"
            title="Expenses by category"
            height={320}
          />
        ) : (
          <Card>
            <CardHeader><CardTitle>Expenses by category</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">No expenses recorded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Monthly breakdown</h2>
        <DataTable
          data={breakdownRows}
          keyField="month"
          columns={[
            { id: "month", header: "Month", accessorKey: "month", sortable: true },
            { id: "revenue", header: "Revenue", accessorKey: "revenue", sortable: true },
            { id: "expenses", header: "Expenses", accessorKey: "expenses", sortable: true },
            { id: "net", header: "Net", accessorKey: "net", sortable: true },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Overdue</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(kpis.overdue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payroll pending</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(payrollTotals.pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.invoiceCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
