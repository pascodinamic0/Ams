import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getExpenses, getExpenseCategories, getSchoolCurrencyForSchool } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";
import { ExpenseForm } from "./expense-form";
import { ExpensesTable } from "./expenses-table";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; category?: string; status?: string }>;
}) {
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };
  const branchId = profile?.branch_id ?? "";

  const statusFilter =
    params.status === "pending" ||
    params.status === "approved" ||
    params.status === "rejected"
      ? params.status
      : undefined;

  const [expenses, categories, currency] = await Promise.all([
    getExpenses({ ...scope, category: params.category, status: statusFilter }),
    getExpenseCategories(scope),
    getSchoolCurrencyForSchool(profile?.school_id),
  ]);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);

  const editingExpense = params.edit
    ? expenses.find((e) => e.id === params.edit) ?? null
    : null;
  const approvedTotal = expenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === "pending").length;

  const statusLinks = [
    { key: undefined, label: tc("all") },
    { key: "pending", label: t("statusPending") },
    { key: "approved", label: t("statusApproved") },
    { key: "rejected", label: t("statusRejected") },
  ] as const;

  const segmentClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-white"
        : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("expensesTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("expensesApprovalHint")}</p>
        </div>
        <div className="text-right text-sm text-stone-500">
          <p>{t("totalLabel", { amount: formatCurrency(approvedTotal) })}</p>
          {pendingCount > 0 ? (
            <p className="text-amber-700 dark:text-amber-400">
              {t("pendingApprovalCount", { count: pendingCount })}
            </p>
          ) : null}
        </div>
      </div>

      {branchId ? (
        <>
          {editingExpense ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{t("editExpense")}</h2>
                <Link href="/finance/expenses" className="text-sm text-blue-600 hover:underline">
                  {tc("cancel")}
                </Link>
              </div>
              <ExpenseForm
                branchId={branchId}
                categories={categories}
                expense={editingExpense}
                currencySymbol={currency.symbol}
              />
            </div>
          ) : (
            <ExpenseForm branchId={branchId} categories={categories} currencySymbol={currency.symbol} />
          )}
        </>
      ) : (
        <p className="text-sm text-stone-500">{t("assignBranchExpenses")}</p>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3 dark:border-stone-700 dark:bg-stone-900">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-stone-500">
            {tc("status")}
          </span>
          <div
            className="inline-flex flex-wrap gap-0.5 rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800"
            role="group"
            aria-label={tc("status")}
          >
            {statusLinks.map((link) => {
              const href = link.key
                ? `/finance/expenses?status=${link.key}${params.category ? `&category=${encodeURIComponent(params.category)}` : ""}`
                : `/finance/expenses${params.category ? `?category=${encodeURIComponent(params.category)}` : ""}`;
              const active = statusFilter === link.key || (!statusFilter && !link.key);
              return (
                <Link
                  key={link.label}
                  href={href}
                  className={segmentClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div
          className="hidden h-8 w-px shrink-0 bg-stone-200 sm:block dark:bg-stone-700"
          aria-hidden
        />

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-stone-500">
            {t("colCategory")}
          </span>
          <div
            className="inline-flex flex-wrap gap-0.5 rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800"
            role="group"
            aria-label={t("colCategory")}
          >
            <Link
              href={`/finance/expenses${statusFilter ? `?status=${statusFilter}` : ""}`}
              className={segmentClass(!params.category)}
              aria-current={!params.category ? "page" : undefined}
            >
              {tc("all")}
            </Link>
            {categories.map((category) => {
              const href = statusFilter
                ? `/finance/expenses?status=${statusFilter}&category=${encodeURIComponent(category)}`
                : `/finance/expenses?category=${encodeURIComponent(category)}`;
              const active = params.category === category;
              return (
                <Link
                  key={category}
                  href={href}
                  className={segmentClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title={t("noExpenses")}
          description={t("noExpensesDesc")}
        />
      ) : (
        <ExpensesTable expenses={expenses} currencyCode={currency.code} />
      )}
    </div>
  );
}
