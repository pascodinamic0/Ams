import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOperationsDashboardData } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function OperationsDashboard() {
  const t = await getTranslations("operations");
  const profile = await getCurrentProfile();
  const kpis = await getOperationsDashboardData({
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>{t("libraryTitles")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.libraryTitles}</p>
            <p className="text-sm text-stone-500">{t("onLoan", { count: kpis.booksOnLoan })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("overdueLoans")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{kpis.overdueLoans}</p>
            <p className="text-sm text-stone-500">{t("pastDueDate")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("staffTitle")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.staffCount}</p>
            <p className="text-sm text-stone-500">{t("operationsStaff")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("transportRoutes")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.transportRoutes}</p>
            <p className="text-sm text-stone-500">{t("activeRoutes")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("upcomingEvents")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.upcomingEvents}</p>
            <p className="text-sm text-stone-500">{t("next30Days")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("quickActions")}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/operations/library"><Button size="sm" className="w-full">{t("libraryTitle")}</Button></Link>
            <Link href="/operations/transport"><Button size="sm" variant="ghost" className="w-full">{t("transportTitle")}</Button></Link>
            <Link href="/operations/events"><Button size="sm" variant="ghost" className="w-full">{t("eventsTitle")}</Button></Link>
            <Link href="/operations/staff"><Button size="sm" variant="ghost" className="w-full">{t("staffTitle")}</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
