import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { ExportPdfButton } from "@/components/students/export-pdf-button";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath, normalizeRole } from "@/lib/auth/rbac";
import { getDailyActivityReport } from "@/lib/db/reports";
import {
  getDailyReportsEnabledForSchool,
  getSchoolCurrencyForSchool,
} from "@/lib/db/schools";
import {
  ActivityReportPrintStyles,
  ActivityReportView,
} from "../activity-report-view";
import { ReportPeriodTabs } from "../report-period-tabs";
import { DatePicker } from "./date-picker";

const ALLOWED_ROLES = new Set(["academic_admin", "principal", "super_admin"]);

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

export default async function DailyActivityReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/academic");
  if (!canAccessPath(profile.role, "/academic/reports/daily")) {
    redirect("/academic");
  }

  const role = normalizeRole(profile.role);
  if (!ALLOWED_ROLES.has(role)) {
    redirect("/academic");
  }

  const dailyEnabled = await getDailyReportsEnabledForSchool(profile.school_id);
  if (!dailyEnabled) {
    redirect("/academic/reports/monthly");
  }

  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const params = await searchParams;
  const date = parseDateParam(params.date);

  const [report, currency] = await Promise.all([
    getDailyActivityReport(profile.school_id, date),
    getSchoolCurrencyForSchool(profile.school_id),
  ]);

  const periodDisplay = format(new Date(`${date}T12:00:00`), "PPPP");
  const monthQuery = date.slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{t("dailyReportTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("dailyReportSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportPeriodTabs
            monthlyLabel={t("reportPeriodMonthly")}
            dailyLabel={t("reportPeriodDaily")}
            dailyEnabled={dailyEnabled}
            monthQuery={monthQuery}
            dateQuery={date}
          />
          <DatePicker date={date} label={t("reportDay")} />
          <ExportPdfButton label={t("exportPdf")} />
        </div>
      </div>

      <ActivityReportView
        report={report}
        mode="daily"
        currency={currency}
        periodDisplay={periodDisplay}
        labels={{
          reportLabel: t("dailyReportLabel"),
          summary: t("dailySummary"),
          tasksCompletedCount: t("tasksCompletedCount"),
          financeTasksCompletedCount: t("financeTasksCompletedCount"),
          expensesApprovedCount: t("expensesApprovedCount"),
          expensesRejectedCount: t("expensesRejectedCount"),
          approvedExpenseTotal: t("approvedExpenseTotal"),
          rejectedExpenseTotal: t("rejectedExpenseTotal"),
          incomeCollectedTotal: t("incomeCollectedTotal"),
          newEnrollmentIncomeTotal: t("newEnrollmentIncomeTotal"),
          netIncomeTotal: t("netIncomeTotal"),
          tasksCompletedSection: t("tasksCompletedSection"),
          expenseDecisionsSection: t("expenseDecisionsSection"),
          incomeSection: t("incomeSection"),
          noTasksCompleted: t("noTasksCompletedDaily"),
          noExpenseDecisions: t("noExpenseDecisionsDaily"),
          noIncomePayments: t("noIncomePaymentsDaily"),
          colTask: t("colTask"),
          colDepartment: t("colDepartment"),
          colRelated: t("colRelated"),
          colCompleted: t("colCompleted"),
          colCategory: t("colCategory"),
          colAmount: t("colAmount"),
          colDecision: t("colDecision"),
          colReceipt: t("colReceipt"),
          colDecidedOn: t("colDecidedOn"),
          colStudent: t("colStudent"),
          colClass: t("colClass"),
          colMethod: t("colMethod"),
          colPaidOn: t("colPaidOn"),
          colIncomeLine: t("colIncomeLine"),
          incomeLineForStudent: t("incomeLineForStudent"),
          newEnrollmentBadge: t("newEnrollmentBadge"),
          reportFooter: t("dailyReportFooter"),
          authorizedSignature: t("authorizedSignature"),
          issuedOn: t("issuedOn"),
          emptyDash: tc("emptyDash"),
        }}
      />

      <p className="text-sm text-stone-500 print:hidden">
        <Link href="/academic/tasks" className="text-blue-600 hover:underline">
          {t("backToTasks")}
        </Link>
      </p>

      <ActivityReportPrintStyles mode="daily" />
    </div>
  );
}
