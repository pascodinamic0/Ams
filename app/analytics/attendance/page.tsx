import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getAttendanceAnalytics } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AttendanceAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  const data = await getAttendanceAnalytics({
    schoolId: profile?.school_id ?? undefined,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Daily trends and class comparisons · {data.overallRate}% overall
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <form className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="startDate" className="text-sm text-slate-500">From</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={params.startDate}
                className="mt-1 block rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="text-sm text-slate-500">To</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={params.endDate}
                className="mt-1 block rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-slate-900"
            >
              Apply
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={data.dailyAttendance}
          type="line"
          xKey="name"
          yKey="value"
          title="Daily attendance %"
        />
        <Chart
          data={data.classAttendance}
          type="bar"
          xKey="name"
          yKey="value"
          title="Class-wise attendance %"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Low attendance (&lt; 80%)</h2>
        {data.lowAttendanceStudents.length === 0 ? (
          <EmptyState
            title="No at-risk students"
            description="All tracked students are above 80% attendance"
          />
        ) : (
          <DataTable
            data={data.lowAttendanceStudents.map((s) => ({
              ...s,
              id: s.student_id,
              percentage: `${s.percentage}%`,
            }))}
            columns={[
              { id: "name", header: "Student", accessorKey: "name", sortable: true },
              { id: "student_id", header: "ID", accessorKey: "student_id" },
              { id: "class_name", header: "Class", accessorKey: "class_name" },
              { id: "percentage", header: "Attendance", accessorKey: "percentage", sortable: true },
            ]}
          />
        )}
      </div>
    </div>
  );
}
