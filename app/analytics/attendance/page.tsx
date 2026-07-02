import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getAttendanceAnalytics } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function AttendanceAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const t = await getTranslations("analytics");
  const tc = await getTranslations("common");
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
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("attendanceTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {t("attendanceSubtitle", { rate: data.overallRate })}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <form className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="startDate" className="text-sm text-stone-500">{tc("from")}</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={params.startDate}
                className="mt-1 block rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="text-sm text-stone-500">{tc("to")}</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={params.endDate}
                className="mt-1 block rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-stone-900"
            >
              {t("applyFilter")}
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
          title={t("chartDailyAttendance")}
        />
        <Chart
          data={data.classAttendance}
          type="bar"
          xKey="name"
          yKey="value"
          title={t("chartClassAttendance")}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">{t("lowAttendanceTitle")}</h2>
        {data.lowAttendanceStudents.length === 0 ? (
          <EmptyState
            title={t("noAtRiskStudents")}
            description={t("noAtRiskDesc")}
          />
        ) : (
          <DataTable
            data={data.lowAttendanceStudents.map((s) => ({
              ...s,
              id: s.student_id,
              percentage: `${s.percentage}%`,
            }))}
            columns={[
              { id: "name", header: t("colStudent"), accessorKey: "name", sortable: true },
              { id: "student_id", header: t("colId"), accessorKey: "student_id" },
              { id: "class_name", header: t("colClass"), accessorKey: "class_name" },
              { id: "percentage", header: t("colAttendance"), accessorKey: "percentage", sortable: true },
            ]}
          />
        )}
      </div>
    </div>
  );
}
