"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import type { InvoiceListItem } from "@/lib/db/invoices";
import { InvoiceActions } from "./invoice-actions";

export function InvoicesTable({ rows }: { rows: InvoiceListItem[] }) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");

  const data = rows.map((row) => ({
    id: row.id,
    student_id: row.student_id,
    student_name: row.student_name,
    amount: row.amount,
    amount_paid: row.amount_paid,
    balance: row.balance,
    due_date: row.due_date,
    status: row.status,
  }));

  return (
    <DataTable
      data={data}
      columns={[
        {
          id: "student_id",
          header: t("colStudentId"),
          accessorKey: "student_id",
          sortable: true,
        },
        {
          id: "student_name",
          header: t("colStudent"),
          accessorKey: "student_name",
          sortable: true,
        },
        {
          id: "amount",
          header: tc("amount"),
          accessorKey: "amount",
          sortable: true,
        },
        {
          id: "amount_paid",
          header: tc("paid"),
          accessorKey: "amount_paid",
        },
        {
          id: "balance",
          header: tc("balance"),
          accessorKey: "balance",
          sortable: true,
        },
        {
          id: "due_date",
          header: t("colDueDate"),
          accessorKey: "due_date",
          sortable: true,
        },
        { id: "status", header: tc("status"), accessorKey: "status" },
        {
          id: "actions",
          header: tc("actions"),
          accessorKey: "id",
          className: "w-px whitespace-nowrap !px-3",
          cell: (row) => (
            <InvoiceActions id={String(row.id)} status={String(row.status)} />
          ),
        },
      ]}
    />
  );
}
