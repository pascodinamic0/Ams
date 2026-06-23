import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAcademicDashboardData } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function AcademicDashboard() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();
  const data = await getAcademicDashboardData(profile?.school_id ?? undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {data.totalStudents === 0 && data.classes === 0 && (
        <p className="text-sm text-slate-500">{t("emptySchoolHint")}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>{t("studentsTitle")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalStudents}</p>
            <p className="text-sm text-slate-500">{t("activeStudents", { count: data.activeStudents })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("classesTitle")}</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{data.classes}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("pendingAdmissions")}</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{data.pendingAdmissions}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("quickActions")}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/academic/students/new"><Button size="sm" className="w-full">{t("addStudent")}</Button></Link>
            <Link href="/academic/admissions"><Button size="sm" variant="ghost" className="w-full">{t("reviewAdmissions")}</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
