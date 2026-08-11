import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/rbac";
import { getBudgetPlanById } from "@/lib/db/budget";
import { getSchoolById, getSchoolCurrencyForSchool } from "@/lib/db/schools";
import { formatMoney } from "@/lib/currency";
import { formatSchoolYear } from "@/lib/academic/school-year";
import { BudgetLineForm } from "./budget-line-form";
import { BudgetLineActions } from "./budget-line-actions";
import {
  BudgetPlanStatusSelect,
  BudgetPrintHint,
} from "./budget-plan-controls";

export default async function BudgetPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/finance");
  if (!canAccessPath(profile.role, "/finance/budget")) redirect("/finance");

  const { id } = await params;
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");

  const [plan, school, currency] = await Promise.all([
    getBudgetPlanById(id, profile.school_id),
    getSchoolById(profile.school_id),
    getSchoolCurrencyForSchool(profile.school_id),
  ]);

  if (!plan) notFound();

  const money = (n: number) => formatMoney(n, currency.code);
  const issuedOn = format(new Date(), "yyyy-MM-dd");

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
            {t("budgetYear")}: {formatSchoolYear(plan.year)}
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

      <article className="budget-plan-report rounded-xl border border-stone-200 bg-white p-8 text-stone-900 shadow-sm dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-6 dark:border-stone-700">
          <div className="flex items-start gap-4">
            {school?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.logo_url}
                alt=""
                className="h-16 w-16 rounded-lg object-contain"
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {t("yearlyBudgetLabel")}
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {school?.name ?? t("budgetTitle")}
              </h2>
              <p className="mt-1 text-lg font-medium">{plan.title}</p>
              {school?.address ? (
                <p className="mt-1 text-sm text-stone-500">{school.address}</p>
              ) : null}
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">
              {t("budgetYear")}: {formatSchoolYear(plan.year)}
            </p>
            <p className="mt-1 capitalize text-stone-500">{plan.status}</p>
            <p className="mt-1 text-stone-500">
              {t("budgetIssuedOn")}: {issuedOn}
            </p>
            <p className="mt-3 text-xl font-bold">{money(plan.total)}</p>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              {t("colPlanTotal")}
            </p>
          </div>
        </header>

        {plan.notes ? (
          <p className="mt-4 text-sm text-stone-600 dark:text-stone-300">
            {plan.notes}
          </p>
        ) : null}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plan.totalsByCategory.map((row) => (
            <div
              key={row.category}
              className="rounded-lg border border-stone-200 px-4 py-3 dark:border-stone-700"
            >
              <p className="text-xs uppercase tracking-wide text-stone-500">
                {row.category}
              </p>
              <p className="mt-1 text-lg font-semibold">{money(row.total)}</p>
              <p className="text-xs text-stone-500">
                {t("lineCountShort", { count: row.count })}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {t("budgetLinesSection")}
          </h3>
          {plan.lines.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t("noBudgetLines")}</p>
          ) : (
            [...linesByCategory.entries()].map(([category, lines]) => (
              <div key={category} className="mt-5">
                <h4 className="font-semibold">{category}</h4>
                <table className="mt-2 w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                      <th className="py-2 pr-2 font-medium">{t("budgetItemName")}</th>
                      <th className="py-2 pr-2 font-medium">{t("budgetQuantity")}</th>
                      <th className="py-2 pr-2 font-medium">{t("budgetUnitCost")}</th>
                      <th className="py-2 pr-2 font-medium">{t("colLineTotal")}</th>
                      <th className="py-2 pr-2 font-medium">{t("budgetPeriod")}</th>
                      <th className="py-2 pr-2 font-medium">{tc("status")}</th>
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
                        <td className="py-2 pr-2 align-top">{line.quantity}</td>
                        <td className="py-2 pr-2 align-top">
                          {money(line.unit_cost)}
                        </td>
                        <td className="py-2 pr-2 align-top font-medium">
                          {money(line.total)}
                        </td>
                        <td className="py-2 pr-2 align-top">
                          {line.period_type}/{line.period_key}
                        </td>
                        <td className="py-2 pr-2 align-top capitalize">
                          {line.status}
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
                </table>
              </div>
            ))
          )}
        </section>

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
        @media print {
          body * { visibility: hidden; }
          .budget-plan-report, .budget-plan-report * { visibility: visible; }
          .budget-plan-report {
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
