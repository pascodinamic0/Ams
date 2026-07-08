import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getExpenses, getExpenseCategories, getSchoolCurrencyForSchool } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";
import { ExpenseForm } from "./expense-form";
import { ExpenseActions } from "./expense-actions";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; category?: string }>;
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

  const [expenses, categories, currency] = await Promise.all([
    getExpenses({ ...scope, category: params.category }),
    getExpenseCategories(scope),
    getSchoolCurrencyForSchool(profile?.school_id),
  ]);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);

  const editingExpense = params.edit
    ? expenses.find((e) => e.id === params.edit) ?? null
    : null;
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const tableData = expenses.map((row) => ({
    ...row,
    actions: <ExpenseActions id={row.id as string} />,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("expensesTitle")}</h1>
        <p className="text-sm text-stone-500">
          {t("totalLabel", { amount: formatCurrency(total) })}
        </p>
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

      <div className="flex flex-wrap gap-2">
        <Link
          href="/finance/expenses"
          className={`rounded-full px-3 py-1 text-sm ${!params.category ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border hover:bg-stone-50 dark:hover:bg-stone-900"}`}
        >
          {t("allCategories")}
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/finance/expenses?category=${encodeURIComponent(category)}`}
            className={`rounded-full px-3 py-1 text-sm ${params.category === category ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border hover:bg-stone-50 dark:hover:bg-stone-900"}`}
          >
            {category}
          </Link>
        ))}
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title={t("noExpenses")}
          description={t("noExpensesDesc")}
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "date", header: tc("date"), accessorKey: "date", sortable: true },
            { id: "category", header: t("colCategory"), accessorKey: "category", sortable: true },
            { id: "amount", header: tc("amount"), accessorKey: "amount", sortable: true },
            { id: "description", header: tc("description"), accessorKey: "description" },
            { id: "branch_name", header: t("colBranch"), accessorKey: "branch_name" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
