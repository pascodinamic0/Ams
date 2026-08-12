import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAcademicDashboardData } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getRoleWorkspace } from "@/lib/auth/role-workspaces";
import { getDisciplineStats, getSchoolTaskStats } from "@/lib/db/workspaces";
import { getTranslations } from "next-intl/server";

export default async function AcademicDashboard() {
  const t = await getTranslations("academic");
  const tRoles = await getTranslations("roles");
  const profile = await getCurrentProfile();
  const workspace = getRoleWorkspace(profile?.role, tRoles);
  const schoolId = profile?.school_id ?? undefined;

  const [data, taskStats, disciplineStats] = await Promise.all([
    getAcademicDashboardData(schoolId),
    getSchoolTaskStats(schoolId),
    getDisciplineStats(schoolId),
  ]);

  const metrics = [
    {
      key: "students",
      label: t("studentsTitle"),
      value: data.totalStudents,
      hint: t("activeStudents", { count: data.activeStudents }),
    },
    {
      key: "classes",
      label: t("classesTitle"),
      value: data.classes,
      hint: t("configuredClasses"),
    },
    {
      key: "admissions",
      label: t("pendingAdmissions"),
      value: data.pendingAdmissions,
      hint: t("awaitingDecision"),
    },
    {
      key: "openTasks",
      label: t("openTasks"),
      value: taskStats.openTasks,
      hint: t("overdueCount", { count: taskStats.overdueTasks }),
    },
    {
      key: "overdueTasks",
      label: t("overdueTasks"),
      value: taskStats.overdueTasks,
      hint: t("needFollowUp"),
    },
    {
      key: "openIncidents",
      label: t("openDisciplineCases"),
      value: disciplineStats.openIncidents,
      hint: t("disciplineStatusHint"),
    },
  ].filter((metric) => workspace.metricHints.includes(metric.key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{workspace.title}</h1>
        <p className="mt-1 text-sm text-stone-500">{workspace.subtitle}</p>
        <p className="mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">
          {workspace.focusQuestion}
        </p>
      </div>

      {data.totalStudents === 0 && data.classes === 0 && (
        <p className="text-sm text-stone-500">{t("emptySchoolHint")}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.key}>
            <CardHeader>
              <CardTitle>{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className="text-sm text-stone-500">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle>{t("quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {workspace.quickActions.map((action) => (
              <Link key={action.href + action.label} href={action.href}>
                <Button
                  size="sm"
                  variant={action.variant ?? "primary"}
                  className="w-full"
                >
                  {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
