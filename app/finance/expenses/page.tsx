import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getExpenses, getExpenseCategories, getSchoolCurrencyForSchool } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";
import { ExpenseForm } from "./expense-form";
import { ExpenseActions } from "./expense-actions";

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "approved"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : status === "rejected"
        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

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
  const tableData = expenses.map((row) => ({
    ...row,
    amount: formatCurrency(row.amount),
    status: <StatusBadge status={row.status} />,
    receipt_number: row.receipt_number ?? "—",
    actions: (
      <ExpenseActions
        id={row.id as string}
        status={row.status}
        receiptNumber={row.receipt_number}
      />
    ),
  }));

  const statusLinks = [
    { key: undefined, label: t("allStatuses") },
    { key: "pending", label: t("statusPending") },
    { key: "approved", label: t("statusApproved") },
    { key: "rejected", label: t("statusRejected") },
  ] as const;

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

      <div className="flex flex-wrap gap-2">
        {statusLinks.map((link) => {
          const href = link.key
            ? `/finance/expenses?status=${link.key}${params.category ? `&category=${encodeURIComponent(params.category)}` : ""}`
            : `/finance/expenses${params.category ? `?category=${encodeURIComponent(params.category)}` : ""}`;
          const active = statusFilter === link.key || (!statusFilter && !link.key);
          return (
            <Link
              key={link.label}
              href={href}
              className={`rounded-full px-3 py-1 text-sm ${active ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border hover:bg-stone-50 dark:hover:bg-stone-900"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/finance/expenses${statusFilter ? `?status=${statusFilter}` : ""}`}
          className={`rounded-full px-3 py-1 text-sm ${!params.category ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border hover:bg-stone-50 dark:hover:bg-stone-900"}`}
        >
          {t("allCategories")}
        </Link>
        {categories.map((category) => {
          const href = statusFilter
            ? `/finance/expenses?status=${statusFilter}&category=${encodeURIComponent(category)}`
            : `/finance/expenses?category=${encodeURIComponent(category)}`;
          return (
            <Link
              key={category}
              href={href}
              className={`rounded-full px-3 py-1 text-sm ${params.category === category ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border hover:bg-stone-50 dark:hover:bg-stone-900"}`}
            >
              {category}
            </Link>
          );
        })}
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
            { id: "status", header: tc("status"), accessorKey: "status" },
            { id: "receipt_number", header: t("colReceipt"), accessorKey: "receipt_number" },
            { id: "description", header: tc("description"), accessorKey: "description" },
            { id: "branch_name", header: t("colBranch"), accessorKey: "branch_name" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
