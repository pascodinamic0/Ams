import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { ExportButton } from "@/components/ui/export-button";
import { getFinanceAnalytics, getSchoolCurrencyForSchool } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";

export default async function AnalyticsFinancePage() {
  const t = await getTranslations("analytics");
  const tf = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const [data, currency] = await Promise.all([
    getFinanceAnalytics({
      schoolId: profile?.school_id ?? undefined,
      branchId: profile?.branch_id ?? undefined,
    }),
    getSchoolCurrencyForSchool(profile?.school_id),
  ]);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);

  const kpis = [
    { label: tf("outstanding"), value: formatCurrency(data.kpis.outstanding) },
    { label: tf("collected"), value: formatCurrency(data.kpis.collected) },
    { label: tf("overdue"), value: formatCurrency(data.kpis.overdue) },
    { label: tf("invoicesKpi"), value: data.kpis.invoiceCount },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("financeTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("financeAnalyticsSubtitle")}</p>
        </div>
        <ExportButton
          data={data.exportRows}
          columns={[
            { key: "month", label: t("colMonth") },
            { key: "collected", label: t("colCollected") },
          ]}
          filename="finance-analytics"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-6">
              <p className="text-sm text-stone-500">{kpi.label}</p>
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
          title={t("chartRevenueOutstanding")}
        />
        <Chart
          data={data.feeStatusBreakdown}
          type="pie"
          dataKey="value"
          nameKey="name"
          title={t("chartFeeStatus")}
        />
        <Chart
          data={data.monthlyCollection}
          type="line"
          xKey="name"
          yKey="value"
          title={t("chartCollectionTrend")}
        />
      </div>
    </div>
  );
}
