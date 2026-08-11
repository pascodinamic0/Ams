import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/rbac";
import {
  getBudgetPlanById,
  type BudgetLineStatus,
  type BudgetPlanStatus,
  type BudgetPeriodType,
} from "@/lib/db/budget";
import { getSchoolById, getSchoolCurrencyForSchool } from "@/lib/db/schools";
import { formatMoney } from "@/lib/currency";
import { formatSchoolYear } from "@/lib/academic/school-year";
import { BudgetLineForm } from "./budget-line-form";
import { BudgetLineActions } from "./budget-line-actions";
import {
  BudgetPlanStatusSelect,
  BudgetPrintHint,
} from "./budget-plan-controls";

function planStatusLabel(
  status: BudgetPlanStatus,
  t: (key: string) => string
) {
  switch (status) {
    case "draft":
      return t("budgetStatusDraft");
    case "active":
      return t("budgetStatusActive");
    case "archived":
      return t("budgetStatusArchived");
    default:
      return status;
  }
}

function lineStatusLabel(
  status: BudgetLineStatus,
  t: (key: string) => string
) {
  switch (status) {
    case "planned":
      return t("budgetLineStatusPlanned");
    case "in_progress":
      return t("budgetLineStatusInProgress");
    case "done":
      return t("budgetLineStatusDone");
    case "cancelled":
      return t("budgetLineStatusCancelled");
    default:
      return status;
  }
}

function periodLabel(
  periodType: BudgetPeriodType,
  periodKey: string,
  schoolYearLabel: string,
  t: (key: string) => string
) {
  if (periodType === "year") {
    return schoolYearLabel;
  }

  const typeLabel =
    periodType === "quarter"
      ? t("periodQuarter")
      : periodType === "trimester"
        ? t("periodTrimester")
        : periodType === "month"
          ? t("periodMonth")
          : periodType;

  return `${typeLabel} ${periodKey}`;
}

export default async function BudgetPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/finance");
  if (!canAccessPath(profile.role, "/finance/budget")) redirect("/finance");

  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
  const dateLocale = locale === "fr" ? fr : enUS;

  const [plan, school, currency] = await Promise.all([
    getBudgetPlanById(id, profile.school_id),
    getSchoolById(profile.school_id),
    getSchoolCurrencyForSchool(profile.school_id),
  ]);

  if (!plan) notFound();

  const money = (n: number) =>
    formatMoney(n, currency.code, { locale });
  const schoolYearLabel = formatSchoolYear(plan.year);
  const issuedOn = format(new Date(), "d MMMM yyyy", { locale: dateLocale });

  const linesByCategory = new Map<string, typeof plan.lines>();
  for (const line of plan.lines) {
    const list = linesByCategory.get(line.category) ?? [];
    list.push(line);
    linesByCategory.set(line.category, list);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link
            href="/finance/budget"
            className="text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            {t("backToBudgetPlans")}
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{plan.title}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {plan.label ? `${plan.label} · ` : ""}
            {t("budgetYear")}: {schoolYearLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BudgetPlanStatusSelect
            planId={plan.id}
            status={plan.status}
            labels={{
              draft: t("budgetStatusDraft"),
              active: t("budgetStatusActive"),
              archived: t("budgetStatusArchived"),
              updated: t("budgetPlanUpdated"),
              failed: t("budgetPlanUpdateFailed"),
            }}
          />
          <BudgetPrintHint label={t("exportBudgetPdf")} />
        </div>
      </div>

      <div className="print:hidden">
        <BudgetLineForm
          planId={plan.id}
          planYear={plan.year}
          labels={{
            category: t("budgetCategory"),
            name: t("budgetItemName"),
            description: tc("description"),
            quantity: t("budgetQuantity"),
            unitCost: t("budgetUnitCost"),
            periodType: t("budgetPeriodType"),
            periodKey: t("budgetPeriodKey"),
            submit: t("addBudgetLine"),
            created: t("budgetLineCreated"),
            failed: t("budgetLineCreateFailed"),
            periodYear: t("periodYear"),
            periodQuarter: t("periodQuarter"),
            periodTrimester: t("periodTrimester"),
            periodMonth: t("periodMonth"),
          }}
        />
      </div>

      <article className="budget-plan-report rounded-xl border border-stone-200 bg-white p-6 text-stone-900 shadow-sm dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 sm:p-8">
        <header className="budget-report-header border-b border-stone-300 pb-5">
          <div className="budget-report-brand flex min-w-0 items-start gap-4">
            {school?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.logo_url}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-contain"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                {t("yearlyBudgetLabel")}
              </p>
              <h2 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
                {school?.name ?? t("budgetTitle")}
              </h2>
              <p className="mt-1 text-base font-medium text-stone-700 dark:text-stone-200">
                {plan.title}
              </p>
              {school?.address ? (
                <p className="mt-1 text-sm text-stone-500">{school.address}</p>
              ) : null}
            </div>
          </div>

          <dl className="budget-report-meta mt-4 text-sm sm:mt-0">
            <div className="budget-meta-row">
              <dt>{t("budgetYear")}</dt>
              <dd>{schoolYearLabel}</dd>
            </div>
            <div className="budget-meta-row">
              <dt>{tc("status")}</dt>
              <dd>{planStatusLabel(plan.status, t)}</dd>
            </div>
            <div className="budget-meta-row">
              <dt>{t("budgetIssuedOn")}</dt>
              <dd>{issuedOn}</dd>
            </div>
            <div className="budget-meta-row budget-meta-total">
              <dt>{t("grandTotal")}</dt>
              <dd>{money(plan.total)}</dd>
            </div>
          </dl>
        </header>

        {plan.notes ? (
          <p className="mt-4 text-sm text-stone-600 dark:text-stone-300">
            {plan.notes}
          </p>
        ) : null}

        {plan.totalsByCategory.length > 0 ? (
          <section className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              {t("budgetSummaryByCategory")}
            </h3>
            <table className="budget-money-table mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-300">
                  <th className="py-2 pr-3 text-left font-medium">
                    {t("budgetCategory")}
                  </th>
                  <th className="py-2 px-3 text-right font-medium">
                    {t("colLineCount")}
                  </th>
                  <th className="py-2 pl-3 text-right font-medium">
                    {t("colCategoryTotal")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.totalsByCategory.map((row) => (
                  <tr
                    key={row.category}
                    className="border-b border-stone-100 dark:border-stone-800"
                  >
                    <td className="py-2 pr-3 align-top">{row.category}</td>
                    <td className="py-2 px-3 text-right align-top tabular-nums">
                      {row.count}
                    </td>
                    <td className="py-2 pl-3 text-right align-top font-medium tabular-nums">
                      {money(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-400">
                  <td className="py-2.5 pr-3 font-semibold" colSpan={2}>
                    {t("grandTotal")}
                  </td>
                  <td className="py-2.5 pl-3 text-right text-base font-bold tabular-nums">
                    {money(plan.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        ) : null}

        <section className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {t("budgetLinesSection")}
          </h3>
          {plan.lines.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t("noBudgetLines")}</p>
          ) : (
            [...linesByCategory.entries()].map(([category, lines]) => {
              const categoryTotal = lines.reduce(
                (sum, line) => sum + line.total,
                0
              );
              return (
                <div key={category} className="mt-5 break-inside-avoid">
                  <h4 className="font-semibold">{category}</h4>
                  <table className="budget-money-table mt-2 w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-stone-300 text-left">
                        <th className="py-2 pr-2 font-medium">
                          {t("budgetItemName")}
                        </th>
                        <th className="w-14 py-2 px-2 text-right font-medium">
                          {t("budgetQuantity")}
                        </th>
                        <th className="w-28 py-2 px-2 text-right font-medium">
                          {t("budgetUnitCost")}
                        </th>
                        <th className="w-28 py-2 px-2 text-right font-medium">
                          {t("colLineTotal")}
                        </th>
                        <th className="py-2 px-2 font-medium">
                          {t("budgetPeriod")}
                        </th>
                        <th className="py-2 pl-2 font-medium">{tc("status")}</th>
                        <th className="py-2 font-medium print:hidden" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr
                          key={line.id}
                          className="border-b border-stone-100 dark:border-stone-800"
                        >
                          <td className="py-2 pr-2 align-top">
                            <div className="font-medium">{line.name}</div>
                            {line.description ? (
                              <div className="mt-0.5 text-xs text-stone-500">
                                {line.description}
                              </div>
                            ) : null}
                          </td>
                          <td className="py-2 px-2 text-right align-top tabular-nums">
                            {Number(line.quantity)}
                          </td>
                          <td className="py-2 px-2 text-right align-top tabular-nums">
                            {money(line.unit_cost)}
                          </td>
                          <td className="py-2 px-2 text-right align-top font-medium tabular-nums">
                            {money(line.total)}
                          </td>
                          <td className="py-2 px-2 align-top">
                            {periodLabel(
                              line.period_type,
                              line.period_key,
                              schoolYearLabel,
                              t
                            )}
                          </td>
                          <td className="py-2 pl-2 align-top">
                            {lineStatusLabel(line.status, t)}
                          </td>
                          <td className="py-2 align-top print:hidden">
                            <BudgetLineActions
                              lineId={line.id}
                              taskId={line.task_id}
                              labels={{
                                createTask: t("createTaskFromLine"),
                                taskLinked: t("taskAlreadyLinked"),
                                delete: tc("delete"),
                                confirmDelete: t("confirmDeleteBudgetLine"),
                                deleted: t("budgetLineDeleted"),
                                taskCreated: t("budgetTaskCreated"),
                                failed: t("budgetLineActionFailed"),
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-stone-300 bg-stone-50 dark:bg-stone-900/40">
                        <td
                          className="py-2 pr-2 font-semibold"
                          colSpan={3}
                        >
                          {t("categorySubtotal")} — {category}
                        </td>
                        <td className="py-2 px-2 text-right font-bold tabular-nums">
                          {money(categoryTotal)}
                        </td>
                        <td colSpan={2} className="print:table-cell" />
                        <td className="print:hidden" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })
          )}
        </section>

        {plan.lines.length > 0 ? (
          <div className="mt-6 flex justify-end border-t-2 border-stone-400 pt-4">
            <table className="budget-money-table text-sm">
              <tbody>
                <tr>
                  <th className="pr-8 text-left font-semibold uppercase tracking-wide text-stone-600">
                    {t("grandTotal")}
                  </th>
                  <td className="text-right text-xl font-bold tabular-nums">
                    {money(plan.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        <footer className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-500 dark:border-stone-700">
          <p>{t("budgetReportFooter")}</p>
          <div className="mt-8 flex justify-end">
            <div className="w-48 border-t border-stone-400 pt-2 text-center text-xs">
              {t("authorizedSignature")}
            </div>
          </div>
        </footer>
      </article>

      <style>{`
        .budget-report-header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.25rem;
        }
        .budget-report-meta {
          margin-left: auto;
          min-width: 14rem;
          text-align: right;
        }
        .budget-meta-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.75rem 1.25rem;
          align-items: baseline;
          padding: 0.2rem 0;
        }
        .budget-meta-row dt {
          color: #78716c;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: left;
        }
        .budget-meta-row dd {
          margin: 0;
          font-weight: 600;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .budget-meta-total {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #d6d3d1;
        }
        .budget-meta-total dd {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .budget-money-table th,
        .budget-money-table td {
          vertical-align: top;
        }
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body * { visibility: hidden; }
          .budget-plan-report,
          .budget-plan-report * { visibility: visible; }
          .budget-plan-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            color: #000 !important;
            background: #fff !important;
          }
          .budget-report-header {
            display: flex !important;
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
          }
          .budget-report-brand {
            flex: 1 1 auto;
            min-width: 0;
          }
          .budget-report-meta {
            flex: 0 0 auto;
            margin-left: auto !important;
            margin-top: 0 !important;
            min-width: 15rem;
            text-align: right !important;
          }
          .budget-meta-row {
            display: grid !important;
            grid-template-columns: 1fr auto !important;
          }
          .budget-meta-row dt { text-align: left !important; }
          .budget-meta-row dd { text-align: right !important; }
          .budget-money-table .text-right,
          .budget-money-table td:nth-child(2),
          .budget-money-table td:nth-child(3),
          .budget-money-table td:nth-child(4),
          .budget-money-table th:nth-child(2),
          .budget-money-table th:nth-child(3),
          .budget-money-table th:nth-child(4) {
            text-align: right !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
