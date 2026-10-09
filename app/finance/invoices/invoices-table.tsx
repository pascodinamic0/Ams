"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { formatMoney } from "@/lib/currency";
import type { InvoiceListItem } from "@/lib/db/invoices";
import { InvoiceActions } from "./invoice-actions";
import { InvoicePrintSheet } from "./invoice-print-sheet";

type SchoolInfo = {
  name: string;
  logo_url: string | null;
  address: string | null;
};

function isOverdue(row: { status: string; due_date: string }) {
  if (row.status === "paid") return false;
  if (row.status === "overdue") return true;
  return new Date(row.due_date) < new Date(new Date().toDateString());
}

export function InvoicesTable({
  rows,
  school,
  currencyCode,
  issuedOn,
}: {
  rows: InvoiceListItem[];
  school: SchoolInfo | null;
  currencyCode: string;
  issuedOn: string;
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const [printInvoices, setPrintInvoices] = useState<InvoiceListItem[]>([]);
  const [printPending, setPrintPending] = useState(false);

  useEffect(() => {
    if (!printPending) return;
    const timer = window.setTimeout(() => {
      window.print();
      setPrintPending(false);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [printPending, printInvoices]);

  const money = (value: number) => formatMoney(value, currencyCode);
  const dash = tc("emptyDash");

  function statusLabel(row: { status: string; due_date: string }) {
    if (row.status === "paid") return tc("paid");
    return isOverdue(row) ? tc("overdue") : tc("pending");
  }

  const data = rows.map((row) => ({
    id: row.id,
    student_id: row.student_id,
    student_name: row.student_name,
    class_name: row.class_name ?? "",
    amount: row.amount,
    amount_paid: row.amount_paid,
    balance: row.balance,
    due_date: row.due_date,
    status: row.status,
  }));

  return (
    <div data-print-target="invoices">
      <div className="print:hidden">
        <DataTable
          numbered
          data={data}
          columns={[
            {
              id: "student_id",
              header: t("colStudentId"),
              accessorKey: "student_id",
              sortable: true,
              cell: (row) => row.student_id || dash,
            },
            {
              id: "student_name",
              header: t("colStudent"),
              accessorKey: "student_name",
              sortable: true,
            },
            {
              id: "class_name",
              header: t("colClass"),
              accessorKey: "class_name",
              sortable: true,
              cell: (row) => row.class_name || dash,
            },
            {
              id: "amount",
              header: t("colFullYear"),
              accessorKey: "amount",
              sortable: true,
              cell: (row) => money(Number(row.amount)),
            },
            {
              id: "amount_paid",
              header: tc("paid"),
              accessorKey: "amount_paid",
              cell: (row) => money(Number(row.amount_paid)),
            },
            {
              id: "balance",
              header: t("colFacture"),
              accessorKey: "balance",
              sortable: true,
              cell: (row) => (
                <span
                  className={
                    Number(row.balance) > 0
                      ? "font-semibold text-amber-700 dark:text-amber-400"
                      : undefined
                  }
                >
                  {money(Number(row.balance))}
                </span>
              ),
            },
            {
              id: "due_date",
              header: t("colDueDate"),
              accessorKey: "due_date",
              sortable: true,
            },
            {
              id: "status",
              header: tc("status"),
              accessorKey: "status",
              cell: (row) =>
                statusLabel({
                  status: String(row.status),
                  due_date: String(row.due_date),
                }),
            },
            {
              id: "actions",
              header: tc("actions"),
              accessorKey: "id",
              className: "w-px whitespace-nowrap !px-3",
              cell: (row) => (
                <InvoiceActions
                  id={String(row.id)}
                  status={String(row.status)}
                  canDownload={Number(row.balance) > 0}
                  onDownload={() => {
                    const invoice = rows.find((item) => item.id === row.id);
                    if (!invoice) return;
                    setPrintInvoices([invoice]);
                    setPrintPending(true);
                  }}
                />
              ),
            },
          ]}
        />
      </div>
      <InvoicePrintSheet
        invoices={printInvoices}
        school={school}
        currencyCode={currencyCode}
        issuedOn={issuedOn}
      />
    </div>
  );
}
