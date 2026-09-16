import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { ExportPdfButton } from "@/components/students/export-pdf-button";
import {
  ActivityReportPrintStyles,
  ActivityReportView,
} from "@/components/reports/activity-report-view";
import { MonthPicker } from "@/components/reports/month-picker";
import { ReportPeriodTabs } from "@/components/reports/report-period-tabs";
import { getCurrentProfile } from "@/lib/auth/session";
import { getMonthlyActivityReport } from "@/lib/db/reports";
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

function parseMonthParam(raw: string | undefined): { year: number; month: number } {
  const now = new Date();
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
      return { year: y, month: m };
    }
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default async function FinanceMonthlyActivityReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect(getActivityReportHomePath(PORTAL));
  if (!canViewActivityReport(profile.role)) {
    redirect(getActivityReportHomePath(PORTAL));
  }

  const t = await getTranslations("academic");
  const params = await searchParams;
  const { year, month } = parseMonthParam(params.month);
  const monthQuery = `${year}-${String(month).padStart(2, "0")}`;

  const [report, currency, dailyEnabled, labels] = await Promise.all([
    getMonthlyActivityReport(profile.school_id, year, month),
    getSchoolCurrencyForSchool(profile.school_id),
    getDailyReportsEnabledForSchool(profile.school_id),
    getActivityReportViewLabels("monthly"),
  ]);

  const periodDisplay = format(new Date(year, month - 1, 1), "MMMM yyyy");
  const today = new Date().toISOString().slice(0, 10);

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
            dateQuery={today}
          />
          <MonthPicker
            year={year}
            month={month}
            label={t("reportMonth")}
            basePath={BASE_PATH}
          />
          <ExportPdfButton label={t("exportPdf")} />
        </div>
      </div>

      <ActivityReportView
        report={report}
        mode="monthly"
        currency={currency}
        periodDisplay={periodDisplay}
        labels={labels}
      />

      <ActivityReportPrintStyles mode="monthly" />
    </div>
  );
}
