import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { ExportPdfButton } from "@/components/students/export-pdf-button";
import {
  ActivityReportPrintStyles,
  ActivityReportView,
} from "@/components/reports/activity-report-view";
import { DatePicker } from "@/components/reports/date-picker";
import { ReportPeriodTabs } from "@/components/reports/report-period-tabs";
import { getCurrentProfile } from "@/lib/auth/session";
import { getDailyActivityReport } from "@/lib/db/reports";
import {
  getDailyReportsEnabledForSchool,
  getSchoolCurrencyForSchool,
} from "@/lib/db/schools";
import {
  canViewActivityReport,
  getActivityReportBasePath,
  getActivityReportHomePath,
} from "@/lib/reports/activity-report-access";
import { getActivityReportViewLabels } from "@/lib/reports/activity-report-labels";

const PORTAL = "finance" as const;
const BASE_PATH = getActivityReportBasePath(PORTAL);

function parseDateParam(raw: string | undefined): string {
  const now = new Date();
  const fallback = now.toISOString().slice(0, 10);
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return raw;
    }
  }
  return fallback;
}

export default async function FinanceDailyActivityReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect(getActivityReportHomePath(PORTAL));
  if (!canViewActivityReport(profile.role)) {
    redirect(getActivityReportHomePath(PORTAL));
  }

  const dailyEnabled = await getDailyReportsEnabledForSchool(profile.school_id);
  if (!dailyEnabled) {
    redirect(`${BASE_PATH}/monthly`);
  }

  const t = await getTranslations("academic");
  const params = await searchParams;
  const date = parseDateParam(params.date);

  const [report, currency, labels] = await Promise.all([
    getDailyActivityReport(profile.school_id, date),
    getSchoolCurrencyForSchool(profile.school_id),
    getActivityReportViewLabels("daily"),
  ]);

  const periodDisplay = format(new Date(`${date}T12:00:00`), "PPPP");
  const monthQuery = date.slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{t("activityReportTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("activityReportSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportPeriodTabs
            basePath={BASE_PATH}
            monthlyLabel={t("reportPeriodMonthly")}
            dailyLabel={t("reportPeriodDaily")}
            dailyEnabled={dailyEnabled}
            monthQuery={monthQuery}
            dateQuery={date}
          />
          <DatePicker date={date} label={t("reportDay")} basePath={BASE_PATH} />
          <ExportPdfButton label={t("exportPdf")} />
        </div>
      </div>

      <ActivityReportView
        report={report}
        mode="daily"
        currency={currency}
        periodDisplay={periodDisplay}
        labels={labels}
      />

      <ActivityReportPrintStyles mode="daily" />
    </div>
  );
}
