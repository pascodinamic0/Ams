import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/rbac";
import { getBudgetPlans } from "@/lib/db/budget";
import { getSchoolCurrencyForSchool } from "@/lib/db/schools";
import { formatMoney } from "@/lib/currency";
import {
  formatSchoolYear,
  getCurrentSchoolYearStart,
} from "@/lib/academic/school-year";
import { BudgetPlanForm } from "./budget-plan-form";
import { DeleteBudgetPlanButton } from "./delete-plan-button";

export default async function BudgetPlansPage() {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/finance");
  if (!canAccessPath(profile.role, "/finance/budget")) redirect("/finance");

  const t = await getTranslations("finance");
  const tc = await getTranslations("common");

  const [plans, currency] = await Promise.all([
    getBudgetPlans(profile.school_id),
    getSchoolCurrencyForSchool(profile.school_id),
  ]);
  const money = (n: number) => formatMoney(n, currency.code);
  const year = getCurrentSchoolYearStart();

  const tableData = plans.map((plan) => ({
    ...plan,
    year: formatSchoolYear(plan.year),
    total: money(plan.total),
    status: plan.status,
    open: (
      <Link
        href={`/finance/budget/${plan.id}`}
        className="text-sm text-blue-600 hover:underline"
      >
        {t("openBudgetPlan")}
      </Link>
    ),
    actions: (
      <DeleteBudgetPlanButton
        id={plan.id}
        label={tc("delete")}
        confirmLabel={t("confirmDeleteBudgetPlan")}
        successLabel={t("budgetPlanDeleted")}
        failedLabel={t("budgetPlanDeleteFailed")}
      />
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("budgetTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("budgetSubtitle")}</p>
      </div>

      <BudgetPlanForm
        defaultYear={year}
        labels={{
          title: t("budgetPlanTitleField"),
          year: t("budgetYear"),
          labelOptional: t("budgetLabelOptional"),
          notes: t("budgetNotes"),
          submit: t("createBudgetPlan"),
          created: t("budgetPlanCreated"),
          failed: t("budgetPlanCreateFailed"),
        }}
      />

      {plans.length === 0 ? (
        <EmptyState
          title={t("noBudgetPlans")}
          description={t("noBudgetPlansDesc")}
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "title", header: t("budgetPlanTitleField"), accessorKey: "title", sortable: true },
            { id: "year", header: t("budgetYear"), accessorKey: "year", sortable: true },
            { id: "status", header: tc("status"), accessorKey: "status" },
            { id: "line_count", header: t("colLineCount"), accessorKey: "line_count" },
            { id: "total", header: t("colPlanTotal"), accessorKey: "total", sortable: true },
            { id: "open", header: "", accessorKey: "open" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
