"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { formatMoney, type SchoolCurrencyCode } from "@/lib/currency";
import type { ExpenseListItem, ExpenseStatus } from "@/lib/db/expenses";
import { ExpenseActions } from "./expense-actions";

function StatusBadge({ status }: { status: ExpenseStatus }) {
  const t = useTranslations("finance");
  const styles =
    status === "approved"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : status === "rejected"
        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  const label =
    status === "approved"
      ? t("statusApproved")
      : status === "rejected"
        ? t("statusRejected")
        : t("statusPending");
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}

export function ExpensesTable({
  expenses,
  currencyCode,
}: {
  expenses: ExpenseListItem[];
  currencyCode: SchoolCurrencyCode;
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");

  const empty = "\u2014";

  const tableData = expenses.map((row) => ({
    id: row.id,
    date: row.date,
    category: row.category,
    amount: formatMoney(row.amount, currencyCode),
    status: <StatusBadge status={row.status} />,
    receipt_number:
      row.status === "approved" && row.receipt_number ? (
        <Link
          href={`/finance/expenses/${row.id}/receipt?download=1`}
          className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
          title={t("downloadReceipt")}
        >
          {row.receipt_number}
        </Link>
      ) : (
        row.receipt_number ?? empty
      ),
    description: row.description ?? empty,
    actions: (
      <ExpenseActions
        id={row.id}
        status={row.status}
        receiptNumber={row.receipt_number}
      />
    ),
  }));

  return (
    <DataTable
      data={tableData}
      columns={[
        { id: "date", header: tc("date"), accessorKey: "date", sortable: true },
        { id: "category", header: t("colCategory"), accessorKey: "category", sortable: true },
        { id: "amount", header: tc("amount"), accessorKey: "amount", sortable: true },
        { id: "status", header: tc("status"), accessorKey: "status" },
        { id: "receipt_number", header: t("colReceipt"), accessorKey: "receipt_number" },
        { id: "description", header: tc("description"), accessorKey: "description" },
        { id: "actions", header: "", accessorKey: "actions" },
      ]}
    />
  );
}
