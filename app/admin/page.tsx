import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { getAdminDashboardData } from "@/lib/db";

const kpiCards = (data: Awaited<ReturnType<typeof getAdminDashboardData>>) => [
  {
    label: "Schools",
    value: data.schools,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40",
    trend: "+2 this month",
  },
  {
    label: "Total Users",
    value: data.users,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
    trend: "Across all roles",
  },
  {
    label: "Students",
    value: data.students,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40",
    trend: "Active enrollments",
  },
];

export default async function AdminDashboard() {
  const data = await getAdminDashboardData();
  const cards = kpiCards(data);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platform Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Everything across all schools and users
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {c.label}
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                    {c.value}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    {c.trend}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${c.color}`}>{c.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={data.usersByRole}
          type="bar"
          xKey="name"
          yKey="value"
          title="Users by role"
        />
        <Chart
          data={data.schoolsByStatus}
          type="pie"
          dataKey="value"
          nameKey="name"
          title="Schools by status"
        />
      </div>
    </div>
  );
}
