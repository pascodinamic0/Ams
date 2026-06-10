import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getExpenses, getExpenseCategories } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { ExpenseForm } from "./expense-form";
import { ExpenseActions } from "./expense-actions";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; category?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };
  const branchId = profile?.branch_id ?? "";

  const [expenses, categories] = await Promise.all([
    getExpenses({ ...scope, category: params.category }),
    getExpenseCategories(scope),
  ]);

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
        <h1 className="text-2xl font-bold">Expenses</h1>
        <p className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(total)}</span>
        </p>
      </div>

      {branchId ? (
        <>
          {editingExpense ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Edit expense</h2>
                <Link href="/finance/expenses" className="text-sm text-blue-600 hover:underline">
                  Cancel
                </Link>
              </div>
              <ExpenseForm
                branchId={branchId}
                categories={categories}
                expense={editingExpense}
              />
            </div>
          ) : (
            <ExpenseForm branchId={branchId} categories={categories} />
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">Assign a branch to your profile to record expenses.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/finance/expenses"
          className={`rounded-full px-3 py-1 text-sm ${!params.category ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "border hover:bg-slate-50 dark:hover:bg-slate-900"}`}
        >
          All categories
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/finance/expenses?category=${encodeURIComponent(category)}`}
            className={`rounded-full px-3 py-1 text-sm ${params.category === category ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "border hover:bg-slate-50 dark:hover:bg-slate-900"}`}
          >
            {category}
          </Link>
        ))}
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Track operational spending by category and date"
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "date", header: "Date", accessorKey: "date", sortable: true },
            { id: "category", header: "Category", accessorKey: "category", sortable: true },
            { id: "amount", header: "Amount", accessorKey: "amount", sortable: true },
            { id: "description", header: "Description", accessorKey: "description" },
            { id: "branch_name", header: "Branch", accessorKey: "branch_name" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
