import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart-lazy";
import { DataTable } from "@/components/ui/data-table";
import { getStudentAnalytics, getAcademicDashboardData } from "@/lib/db";
import { getClasses } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function StudentAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const t = await getTranslations("analytics");
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const scope = { schoolId: profile?.school_id ?? undefined };

  const [data, academicData, classes] = await Promise.all([
    getStudentAnalytics({ ...scope, classId: params.classId }),
    getAcademicDashboardData(scope.schoolId),
    getClasses(profile?.branch_id ?? undefined),
  ]);

  const noDataLabel = t("noData");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("studentsTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {t("studentsSummary", {
              students: academicData.totalStudents,
              classes: academicData.classes,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/analytics/students"
            className={`rounded-lg border px-3 py-1.5 text-sm ${!params.classId ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900" : "text-stone-600"}`}
          >
            {t("allClasses")}
          </Link>
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/analytics/students?classId=${c.id}`}
              className={`rounded-lg border px-3 py-1.5 text-sm ${params.classId === c.id ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900" : "text-stone-600"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={data.studentsByClass.length ? data.studentsByClass : [{ name: noDataLabel, value: 0 }]}
          type="bar"
          xKey="name"
          yKey="value"
          title={t("chartStudentsByClass")}
        />
        <Chart
          data={data.gradeTrend.length ? data.gradeTrend : [{ name: noDataLabel, average: 0 }]}
          type="line"
          xKey="name"
          yKey="average"
          title={t("chartAverageMarks")}
        />
        <Chart
          data={data.subjectPerformance.length ? data.subjectPerformance : [{ name: noDataLabel, value: 0 }]}
          type="bar"
          xKey="name"
          yKey="value"
          title={t("chartSubjectPerformance")}
        />
        <Chart
          data={data.passFailByClass.length ? data.passFailByClass : [{ name: noDataLabel, pass: 0, fail: 0 }]}
          type="bar"
          xKey="name"
          yKeys={["pass", "fail"]}
          title={t("chartPassFail")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("topPerformers")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPerformers.length === 0 ? (
              <p className="text-sm text-stone-500">{t("noGradeData")}</p>
            ) : (
              <DataTable
                data={data.topPerformers.map((s) => ({ ...s, id: s.student_id }))}
                columns={[
                  { id: "name", header: t("colStudent"), accessorKey: "name" },
                  { id: "student_id", header: t("colId"), accessorKey: "student_id" },
                  { id: "average", header: t("colAverage"), accessorKey: "average" },
                ]}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("needsSupport")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.bottomPerformers.length === 0 ? (
              <p className="text-sm text-stone-500">{t("noGradeData")}</p>
            ) : (
              <DataTable
                data={data.bottomPerformers.map((s) => ({ ...s, id: s.student_id }))}
                columns={[
                  { id: "name", header: t("colStudent"), accessorKey: "name" },
                  { id: "student_id", header: t("colId"), accessorKey: "student_id" },
                  { id: "average", header: t("colAverage"), accessorKey: "average" },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
