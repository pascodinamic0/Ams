import { format } from "date-fns";
import type { ActivityReport } from "@/lib/db/reports";
import type { SchoolCurrency } from "@/lib/currency";
import { formatMoney } from "@/lib/currency";

type ReportMode = "monthly" | "daily";

type Labels = {
  reportLabel: string;
  summary: string;
  tasksCompletedCount: string;
  financeTasksCompletedCount: string;
  expensesApprovedCount: string;
  expensesRejectedCount: string;
  approvedExpenseTotal: string;
  rejectedExpenseTotal: string;
  incomeCollectedTotal: string;
  newEnrollmentIncomeTotal: string;
  netIncomeTotal: string;
  tasksCompletedSection: string;
  expenseDecisionsSection: string;
  incomeSection: string;
  noTasksCompleted: string;
  noExpenseDecisions: string;
  noIncomePayments: string;
  colTask: string;
  colDepartment: string;
  colRelated: string;
  colCompleted: string;
  colCategory: string;
  colAmount: string;
  colDecision: string;
  colReceipt: string;
  colDecidedOn: string;
  colStudent: string;
  colClass: string;
  colMethod: string;
  colPaidOn: string;
  colIncomeLine: string;
  incomeLineForStudent: string;
  newEnrollmentBadge: string;
  reportFooter: string;
  authorizedSignature: string;
  issuedOn: string;
  emptyDash: string;
};

type Props = {
  report: ActivityReport;
  mode: ReportMode;
  currency: SchoolCurrency;
  labels: Labels;
  periodDisplay: string;
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 px-4 py-3 dark:border-stone-700">
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

export function ActivityReportView({
  report,
  mode,
  currency,
  labels,
  periodDisplay,
}: Props) {
  const money = (n: number) => formatMoney(n, currency.code);
  const issuedOn = format(new Date(), "yyyy-MM-dd");
  const cssClass =
    mode === "monthly" ? "monthly-activity-report" : "daily-activity-report";

  return (
    <article
      className={`${cssClass} rounded-xl border border-stone-200 bg-white p-8 text-stone-900 shadow-sm dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100`}
    >
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
              {labels.reportLabel}
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {report.school?.name ?? labels.reportLabel}
            </h2>
            {report.school?.address ? (
              <p className="mt-1 text-sm text-stone-500">{report.school.address}</p>
            ) : null}
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{periodDisplay}</p>
          <p className="mt-1 text-stone-500">
            {labels.issuedOn}: {issuedOn}
          </p>
        </div>
      </header>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          {labels.summary}
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            label={labels.incomeCollectedTotal}
            value={money(report.summary.incomeTotal)}
          />
          <SummaryCard
            label={labels.newEnrollmentIncomeTotal}
            value={money(report.summary.newEnrollmentIncomeTotal)}
          />
          <SummaryCard
            label={labels.netIncomeTotal}
            value={money(report.summary.netIncome)}
          />
          <SummaryCard
            label={labels.tasksCompletedCount}
            value={String(report.summary.tasksCompleted)}
          />
          <SummaryCard
            label={labels.financeTasksCompletedCount}
            value={String(report.summary.financeTasksCompleted)}
          />
          <SummaryCard
            label={labels.expensesApprovedCount}
            value={String(report.summary.expensesApproved)}
          />
          <SummaryCard
            label={labels.expensesRejectedCount}
            value={String(report.summary.expensesRejected)}
          />
          <SummaryCard
            label={labels.approvedExpenseTotal}
            value={money(report.summary.approvedExpenseTotal)}
          />
          <SummaryCard
            label={labels.rejectedExpenseTotal}
            value={money(report.summary.rejectedExpenseTotal)}
          />
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          {labels.incomeSection}
        </h3>
        {report.incomePayments.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">{labels.noIncomePayments}</p>
        ) : (
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="py-2 pr-3 font-medium">{labels.colIncomeLine}</th>
                <th className="py-2 pr-3 font-medium">{labels.colStudent}</th>
                <th className="py-2 pr-3 font-medium">{labels.colClass}</th>
                <th className="py-2 pr-3 font-medium">{labels.colMethod}</th>
                <th className="py-2 font-medium">{labels.colPaidOn}</th>
              </tr>
            </thead>
            <tbody>
              {report.incomePayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-stone-100 dark:border-stone-800"
                >
                  <td className="py-2 pr-3 align-top">
                    <div className="font-medium text-emerald-700 dark:text-emerald-400">
                      {labels.incomeLineForStudent
                        .replace("{amount}", money(payment.amount))
                        .replace("{student}", payment.student_name)
                        .replace(
                          "{class}",
                          payment.class_name ?? labels.emptyDash
                        )}
                    </div>
                    {payment.is_new_enrollment ? (
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {labels.newEnrollmentBadge}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <div className="font-medium">{payment.student_name}</div>
                    <div className="text-xs text-stone-500">{payment.student_code}</div>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    {payment.class_name ?? labels.emptyDash}
                  </td>
                  <td className="py-2 pr-3 align-top capitalize">
                    {payment.method.replace("_", " ")}
                  </td>
                  <td className="py-2 align-top">{payment.paid_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          {labels.tasksCompletedSection}
        </h3>
        {report.tasksCompleted.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">{labels.noTasksCompleted}</p>
        ) : (
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="py-2 pr-3 font-medium">{labels.colTask}</th>
                <th className="py-2 pr-3 font-medium">{labels.colDepartment}</th>
                <th className="py-2 pr-3 font-medium">{labels.colRelated}</th>
                <th className="py-2 font-medium">{labels.colCompleted}</th>
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
                      : labels.emptyDash}
                  </td>
                  <td className="py-2 align-top">{task.completed_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          {labels.expenseDecisionsSection}
        </h3>
        {report.expenseDecisions.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">{labels.noExpenseDecisions}</p>
        ) : (
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="py-2 pr-3 font-medium">{labels.colCategory}</th>
                <th className="py-2 pr-3 font-medium">{labels.colAmount}</th>
                <th className="py-2 pr-3 font-medium">{labels.colDecision}</th>
                <th className="py-2 pr-3 font-medium">{labels.colReceipt}</th>
                <th className="py-2 font-medium">{labels.colDecidedOn}</th>
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
                    {expense.receipt_number ?? labels.emptyDash}
                  </td>
                  <td className="py-2 align-top">{expense.approved_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-500 dark:border-stone-700">
        <p>{labels.reportFooter}</p>
        <div className="mt-8 flex justify-end">
          <div className="w-48 border-t border-stone-400 pt-2 text-center text-xs">
            {labels.authorizedSignature}
          </div>
        </div>
      </footer>
    </article>
  );
}

export function ActivityReportPrintStyles({ mode }: { mode: ReportMode }) {
  const cssClass =
    mode === "monthly" ? "monthly-activity-report" : "daily-activity-report";
  return (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        .${cssClass}, .${cssClass} * { visibility: visible; }
        .${cssClass} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          border: none !important;
          box-shadow: none !important;
        }
      }
    `}</style>
  );
}
