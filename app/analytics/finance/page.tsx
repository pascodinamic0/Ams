import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { ExportButton } from "@/components/ui/export-button";
import { getFinanceAnalytics } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function AnalyticsFinancePage() {
  const profile = await getCurrentProfile();
  const data = await getFinanceAnalytics({
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  });

  const kpis = [
    { label: "Outstanding", value: formatCurrency(data.kpis.outstanding) },
    { label: "Collected", value: formatCurrency(data.kpis.collected) },
    { label: "Overdue", value: formatCurrency(data.kpis.overdue) },
    { label: "Invoices", value: data.kpis.invoiceCount },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Revenue trends and fee collection analytics</p>
        </div>
        <ExportButton
          data={data.exportRows}
          columns={[
            { key: "month", label: "Month" },
            { key: "collected", label: "Collected" },
          ]}
          filename="finance-analytics"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={data.monthlyRevenue}
          type="bar"
          xKey="name"
          yKeys={["collected", "outstanding"]}
          title="Revenue vs outstanding (6 months)"
        />
        <Chart
          data={data.feeStatusBreakdown}
          type="pie"
          dataKey="value"
          nameKey="name"
          title="Fee status breakdown"
        />
        <Chart
          data={data.monthlyCollection}
          type="line"
          xKey="name"
          yKey="value"
          title="Fee collection trend"
        />
      </div>
    </div>
  );
}
