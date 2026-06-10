import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { DataTable } from "@/components/ui/data-table";
import { getStudentAnalytics, getAcademicDashboardData } from "@/lib/db";
import { getClasses } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import Link from "next/link";

export default async function StudentAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const scope = { schoolId: profile?.school_id ?? undefined };

  const [data, academicData, classes] = await Promise.all([
    getStudentAnalytics({ ...scope, classId: params.classId }),
    getAcademicDashboardData(scope.schoolId),
    getClasses(profile?.branch_id ?? undefined),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            {academicData.totalStudents} students · {academicData.classes} classes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/analytics/students"
            className={`rounded-lg border px-3 py-1.5 text-sm ${!params.classId ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600"}`}
          >
            All classes
          </Link>
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/analytics/students?classId=${c.id}`}
              className={`rounded-lg border px-3 py-1.5 text-sm ${params.classId === c.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={data.studentsByClass.length ? data.studentsByClass : [{ name: "No data", value: 0 }]}
          type="bar"
          xKey="name"
          yKey="value"
          title="Students by class"
        />
        <Chart
          data={data.gradeTrend.length ? data.gradeTrend : [{ name: "No data", average: 0 }]}
          type="line"
          xKey="name"
          yKey="average"
          title="Average marks by term"
        />
        <Chart
          data={data.subjectPerformance.length ? data.subjectPerformance : [{ name: "No data", value: 0 }]}
          type="bar"
          xKey="name"
          yKey="value"
          title="Subject-wise performance"
        />
        <Chart
          data={data.passFailByClass.length ? data.passFailByClass : [{ name: "No data", pass: 0, fail: 0 }]}
          type="bar"
          xKey="name"
          yKeys={["pass", "fail"]}
          title="Pass / fail by class"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top performers</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPerformers.length === 0 ? (
              <p className="text-sm text-slate-500">No grade data yet</p>
            ) : (
              <DataTable
                data={data.topPerformers.map((s) => ({ ...s, id: s.student_id }))}
                columns={[
                  { id: "name", header: "Student", accessorKey: "name" },
                  { id: "student_id", header: "ID", accessorKey: "student_id" },
                  { id: "average", header: "Average", accessorKey: "average" },
                ]}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Needs support</CardTitle>
          </CardHeader>
          <CardContent>
            {data.bottomPerformers.length === 0 ? (
              <p className="text-sm text-slate-500">No grade data yet</p>
            ) : (
              <DataTable
                data={data.bottomPerformers.map((s) => ({ ...s, id: s.student_id }))}
                columns={[
                  { id: "name", header: "Student", accessorKey: "name" },
                  { id: "student_id", header: "ID", accessorKey: "student_id" },
                  { id: "average", header: "Average", accessorKey: "average" },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
