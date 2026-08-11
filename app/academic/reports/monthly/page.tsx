import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { ExportPdfButton } from "@/components/students/export-pdf-button";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath, normalizeRole } from "@/lib/auth/rbac";
import { getMonthlyActivityReport } from "@/lib/db/reports";
import { getSchoolCurrencyForSchool } from "@/lib/db/schools";
import { formatMoney } from "@/lib/currency";
import { MonthPicker } from "./month-picker";

const ALLOWED_ROLES = new Set(["academic_admin", "principal", "super_admin"]);

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

export default async function MonthlyActivityReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/academic");
  if (!canAccessPath(profile.role, "/academic/reports/monthly")) {
    redirect("/academic");
  }

  const role = normalizeRole(profile.role);
  if (!ALLOWED_ROLES.has(role)) {
    redirect("/academic");
  }

  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const params = await searchParams;
  const { year, month } = parseMonthParam(params.month);

  const [report, currency] = await Promise.all([
    getMonthlyActivityReport(profile.school_id, year, month),
    getSchoolCurrencyForSchool(profile.school_id),
  ]);

  const monthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy");
  const money = (n: number) => formatMoney(n, currency.code);
  const issuedOn = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{t("monthlyReportTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("monthlyReportSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker year={year} month={month} label={t("reportMonth")} />
          <ExportPdfButton label={t("exportPdf")} />
        </div>
      </div>

      <article className="monthly-activity-report rounded-xl border border-stone-200 bg-white p-8 text-stone-900 shadow-sm dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-6 dark:border-stone-700">
          <div className="flex items-start gap-4">
            {report.school?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.school.logo_url}
                alt=""
                className="h-16 w-16 rounded-lg object-contain"
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {t("monthlyReportLabel")}
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {report.school?.name ?? t("monthlyReportTitle")}
              </h2>
              {report.school?.address ? (
                <p className="mt-1 text-sm text-stone-500">{report.school.address}</p>
              ) : null}
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{monthLabel}</p>
            <p className="mt-1 text-stone-500">
              {t("issuedOn")}: {issuedOn}
            </p>
          </div>
        </header>

        <section className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {t("monthlySummary")}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label={t("tasksCompletedCount")}
              value={String(report.summary.tasksCompleted)}
            />
            <SummaryCard
              label={t("financeTasksCompletedCount")}
              value={String(report.summary.financeTasksCompleted)}
            />
            <SummaryCard
              label={t("expensesApprovedCount")}
              value={String(report.summary.expensesApproved)}
            />
            <SummaryCard
              label={t("expensesRejectedCount")}
              value={String(report.summary.expensesRejected)}
            />
            <SummaryCard
              label={t("approvedExpenseTotal")}
              value={money(report.summary.approvedExpenseTotal)}
            />
            <SummaryCard
              label={t("rejectedExpenseTotal")}
              value={money(report.summary.rejectedExpenseTotal)}
            />
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {t("tasksCompletedSection")}
          </h3>
          {report.tasksCompleted.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t("noTasksCompleted")}</p>
          ) : (
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                  <th className="py-2 pr-3 font-medium">{t("colTask")}</th>
                  <th className="py-2 pr-3 font-medium">{t("colDepartment")}</th>
                  <th className="py-2 pr-3 font-medium">{t("colRelated")}</th>
                  <th className="py-2 font-medium">{t("colCompleted")}</th>
                </tr>
              </thead>
              <tbody>
                {report.tasksCompleted.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-stone-100 dark:border-stone-800"
                  >
                    <td className="py-2 pr-3 align-top">
                      <div className="font-medium">{task.title}</div>
                      {task.description ? (
                        <div className="mt-0.5 whitespace-pre-wrap text-xs text-stone-500">
                          {task.description.slice(0, 160)}
                          {task.description.length > 160 ? "..." : ""}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 align-top capitalize">{task.department}</td>
                    <td className="py-2 pr-3 align-top">
                      {task.related_type
                        ? task.related_type.replace("_", " ")
                        : tc("emptyDash")}
                    </td>
                    <td className="py-2 align-top">
                      {task.completed_at.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {t("expenseDecisionsSection")}
          </h3>
          {report.expenseDecisions.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t("noExpenseDecisions")}</p>
          ) : (
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                  <th className="py-2 pr-3 font-medium">{t("colCategory")}</th>
                  <th className="py-2 pr-3 font-medium">{t("colAmount")}</th>
                  <th className="py-2 pr-3 font-medium">{t("colDecision")}</th>
                  <th className="py-2 pr-3 font-medium">{t("colReceipt")}</th>
                  <th className="py-2 font-medium">{t("colDecidedOn")}</th>
                </tr>
              </thead>
              <tbody>
                {report.expenseDecisions.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-stone-100 dark:border-stone-800"
                  >
                    <td className="py-2 pr-3 align-top">
                      <div className="font-medium">{expense.category}</div>
                      {expense.description ? (
                        <div className="mt-0.5 text-xs text-stone-500">
                          {expense.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 align-top">{money(expense.amount)}</td>
                    <td className="py-2 pr-3 align-top capitalize">{expense.status}</td>
                    <td className="py-2 pr-3 align-top">
                      {expense.receipt_number ?? tc("emptyDash")}
                    </td>
                    <td className="py-2 align-top">
                      {expense.approved_at.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-500 dark:border-stone-700">
          <p>{t("monthlyReportFooter")}</p>
          <div className="mt-8 flex justify-end">
            <div className="w-48 border-t border-stone-400 pt-2 text-center text-xs">
              {t("authorizedSignature")}
            </div>
          </div>
        </footer>
      </article>

      <p className="text-sm text-stone-500 print:hidden">
        <Link href="/academic/tasks" className="text-blue-600 hover:underline">
          {t("backToTasks")}
        </Link>
      </p>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .monthly-activity-report, .monthly-activity-report * { visibility: visible; }
          .monthly-activity-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 px-4 py-3 dark:border-stone-700">
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
