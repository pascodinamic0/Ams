import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { getAnalyticsOverview, getAdminDashboardData } from "@/lib/db";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function AnalyticsDashboard() {
  const [overview, adminData] = await Promise.all([
    getAnalyticsOverview(),
    getAdminDashboardData(),
  ]);

  const kpis = [
    { label: "Students", value: overview.totalStudents, sub: `${overview.activeStudents} active` },
    { label: "Attendance rate", value: `${overview.attendanceRate}%`, sub: "Last 4 weeks" },
    { label: "Revenue collected", value: formatCurrency(overview.revenue), sub: "All time" },
    { label: "Schools", value: adminData.schools, sub: `${adminData.users} platform users` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Platform-wide enrollment, attendance, and revenue insights
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
              <p className="mt-1 text-xs text-slate-400">{kpi.sub}</p>
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
          title="Enrollment by class"
        />
        <Chart
          data={overview.attendanceTrend}
          type="line"
          xKey="name"
          yKey="value"
          title="Attendance trend (4 weeks)"
        />
        <Chart
          data={overview.genderDistribution}
          type="pie"
          dataKey="value"
          nameKey="name"
          title="Gender distribution"
        />
        <Chart
          data={overview.gradeDistribution}
          type="pie"
          dataKey="value"
          nameKey="name"
          title="Grade distribution"
        />
      </div>
    </div>
  );
}
