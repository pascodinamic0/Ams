import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart-lazy";
import { getAnalyticsOverview, getAdminDashboardData } from "@/lib/db";
import { getTranslations } from "next-intl/server";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function AnalyticsDashboard() {
  const t = await getTranslations("analytics");
  const [overview, adminData] = await Promise.all([
    getAnalyticsOverview(),
    getAdminDashboardData(),
  ]);

  const kpis = [
    {
      label: t("kpiStudents"),
      value: overview.totalStudents,
      sub: t("kpiActiveStudents", { count: overview.activeStudents }),
    },
    {
      label: t("kpiAttendanceRate"),
      value: `${overview.attendanceRate}%`,
      sub: t("kpiLast4Weeks"),
    },
    {
      label: t("kpiRevenueCollected"),
      value: formatCurrency(overview.revenue),
      sub: t("kpiAllTime"),
    },
    {
      label: t("kpiSchools"),
      value: adminData.schools,
      sub: t("kpiPlatformUsers", { count: adminData.users }),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-stone-500">{kpi.label}</p>
              <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-white">{kpi.value}</p>
              <p className="mt-1 text-xs text-stone-400">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={overview.enrollmentByClass}
          type="bar"
          xKey="name"
          yKey="value"
          title={t("chartEnrollmentByClass")}
        />
        <Chart
          data={overview.attendanceTrend}
          type="line"
          xKey="name"
          yKey="value"
          title={t("chartAttendanceTrend")}
        />
        <Chart
          data={overview.genderDistribution}
          type="pie"
          dataKey="value"
          nameKey="name"
          title={t("chartGenderDistribution")}
        />
        <Chart
          data={overview.gradeDistribution}
          type="pie"
          dataKey="value"
          nameKey="name"
          title={t("chartGradeDistribution")}
        />
      </div>
    </div>
  );
}
