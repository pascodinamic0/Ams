"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteInvoiceButton } from "@/app/finance/invoices/delete-button";
import { formatMoney } from "@/lib/currency";
import type { InvoiceListItem, OutstandingStudentGroup } from "@/lib/db/invoices";

type SchoolInfo = {
  name: string;
  logo_url: string | null;
  address: string | null;
};

function groupByStudent(invoices: InvoiceListItem[]): OutstandingStudentGroup[] {
  const map = new Map<string, OutstandingStudentGroup>();

  for (const inv of invoices) {
    const key = inv.student_uuid || inv.student_id || inv.id;
    const existing = map.get(key);
    if (existing) {
      existing.invoices.push(inv);
      existing.total_balance += inv.balance;
      continue;
    }
    map.set(key, {
      student_uuid: inv.student_uuid,
      student_id: inv.student_id,
      student_name: inv.student_name,
      class_name: inv.class_name,
      total_balance: inv.balance,
      invoices: [inv],
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    a.student_name.localeCompare(b.student_name)
  );
}

type Labels = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  allClasses: string;
  overdueOnly: string;
  studentsWithDebt: string;
  openInvoices: string;
  totalOwed: string;
  downloadInvoice: string;
  noOutstanding: string;
  noOutstandingDesc: string;
  colStudentId: string;
  colStudent: string;
  colClass: string;
  colFeeType: string;
  colDueDate: string;
  colActions: string;
  amount: string;
  paid: string;
  balance: string;
  status: string;
  overdue: string;
  pending: string;
  issuedOn: string;
  pleaseSettle: string;
  invoiceTitle: string;
  invoiceNumber: string;
  invoiceFooter: string;
  emptyDash: string;
  classLabel: string;
  filtersTitle: string;
  debtorsTitle: string;
};

export function OutstandingBoard({
  invoices,
  school,
  currencyCode,
  issuedOn,
  labels,
}: {
  invoices: InvoiceListItem[];
  school: SchoolInfo | null;
  currencyCode: string;
  issuedOn: string;
  labels: Labels;
}) {
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
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

  const classOptions = useMemo(() => {
    const names = new Set<string>();
    for (const inv of invoices) {
      if (inv.class_name) names.add(inv.class_name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const today = new Date(new Date().toDateString());
    const term = search.trim().toLowerCase();

    return invoices.filter((inv) => {
      if (className && inv.class_name !== className) return false;
      if (overdueOnly) {
        const overdue =
          inv.status === "overdue" ||
          (inv.status === "pending" && new Date(inv.due_date) < today);
        if (!overdue) return false;
      }
      if (!term) return true;
      return (
        inv.student_name.toLowerCase().includes(term) ||
        inv.student_id.toLowerCase().includes(term) ||
        (inv.class_name?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [invoices, search, className, overdueOnly]);

  const groups = useMemo(
    () => groupByStudent(filteredInvoices),
    [filteredInvoices]
  );

  const totalOwed = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0),
    [filteredInvoices]
  );

  const money = (value: number) => formatMoney(value, currencyCode);

  function downloadInvoice(inv: InvoiceListItem) {
    setPrintInvoices([inv]);
    setPrintPending(true);
  }

  function statusLabel(inv: InvoiceListItem) {
    const today = new Date(new Date().toDateString());
    const overdue =
      inv.status === "overdue" ||
      (inv.status === "pending" && new Date(inv.due_date) < today);
    return overdue ? labels.overdue : labels.pending;
  }

  function invoiceRef(inv: InvoiceListItem) {
    return inv.id.slice(0, 8).toUpperCase();
  }

  return (
    <div className="space-y-8" data-print-target="invoices">
      {/* Header */}
      <header className="print:hidden">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          {labels.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-500">{labels.subtitle}</p>
      </header>

      {/* KPIs */}
      <section className="grid gap-3 sm:grid-cols-3 print:hidden">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {labels.studentsWithDebt}
          </p>
          <p className="mt-1 text-2xl font-bold">{groups.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {labels.openInvoices}
          </p>
          <p className="mt-1 text-2xl font-bold">{filteredInvoices.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {labels.totalOwed}
          </p>
          <p className="mt-1 text-2xl font-bold">{money(totalOwed)}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="space-y-3 print:hidden">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
          {labels.filtersTitle}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="outstanding-search">{labels.searchPlaceholder}</Label>
            <Input
              id="outstanding-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="outstanding-class">{labels.colClass}</Label>
            <select
              id="outstanding-class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="mt-1 w-full min-w-[160px] rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              <option value="">{labels.allClasses}</option>
              {classOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded border-stone-300"
            />
            {labels.overdueOnly}
          </label>
        </div>
      </section>

      {/* Debtors table */}
      <section className="space-y-3 print:hidden">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
          {labels.debtorsTitle}
        </h2>

        {filteredInvoices.length === 0 ? (
          <EmptyState
            title={labels.noOutstanding}
            description={labels.noOutstandingDesc}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 text-left dark:bg-stone-800/60">
                <tr>
                  <th className="px-3 py-2 font-medium">{labels.colStudentId}</th>
                  <th className="px-3 py-2 font-medium">{labels.colStudent}</th>
                  <th className="px-3 py-2 font-medium">{labels.colClass}</th>
                  <th className="px-3 py-2 font-medium">{labels.colFeeType}</th>
                  <th className="px-3 py-2 font-medium">{labels.amount}</th>
                  <th className="px-3 py-2 font-medium">{labels.paid}</th>
                  <th className="px-3 py-2 font-medium">{labels.balance}</th>
                  <th className="px-3 py-2 font-medium">{labels.colDueDate}</th>
                  <th className="px-3 py-2 font-medium">{labels.status}</th>
                  <th className="px-3 py-2 font-medium">{labels.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t border-stone-100 dark:border-stone-800"
                  >
                    <td className="px-3 py-2">
                      {inv.student_id || labels.emptyDash}
                    </td>
                    <td className="px-3 py-2 font-medium">{inv.student_name}</td>
                    <td className="px-3 py-2">
                      {inv.class_name || labels.emptyDash}
                    </td>
                    <td className="px-3 py-2">
                      {inv.fee_structure_name ||
                        inv.description ||
                        labels.emptyDash}
                    </td>
                    <td className="px-3 py-2">{money(inv.amount)}</td>
                    <td className="px-3 py-2">{money(inv.amount_paid)}</td>
                    <td className="px-3 py-2 font-semibold text-amber-700 dark:text-amber-400">
                      {money(inv.balance)}
                    </td>
                    <td className="px-3 py-2">{inv.due_date}</td>
                    <td className="px-3 py-2">{statusLabel(inv)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadInvoice(inv)}
                          title={labels.downloadInvoice}
                        >
                          <Download className="mr-1 h-3.5 w-3.5" />
                          {labels.downloadInvoice}
                        </Button>
                        <DeleteInvoiceButton id={inv.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Individual invoices / factures - print target */}
      <div className="outstanding-invoices hidden print:block">
        {printInvoices.map((inv) => (
          <article
            key={inv.id}
            className="invoice-doc break-after-page mb-8 border border-stone-300 p-8 print:mb-0 print:break-after-page print:border-0 print:p-0"
          >
            <header className="flex items-start justify-between gap-4 border-b border-stone-300 pb-4">
              <div className="flex items-start gap-4">
                {school?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={school.logo_url}
                    alt=""
                    className="h-14 w-14 object-contain"
                  />
                ) : null}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    {labels.invoiceTitle}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    {school?.name ?? labels.title}
                  </h2>
                  {school?.address ? (
                    <p className="mt-1 text-sm text-stone-500">{school.address}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-stone-500">
                    {labels.invoiceNumber}: {invoiceRef(inv)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-stone-500">
                {labels.issuedOn}: {issuedOn}
              </p>
            </header>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {labels.colStudent}
                </dt>
                <dd className="mt-1 text-lg font-semibold">{inv.student_name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {labels.colStudentId}
                </dt>
                <dd className="mt-1 font-medium">
                  {inv.student_id || labels.emptyDash}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {labels.classLabel}
                </dt>
                <dd className="mt-1 font-medium">
                  {inv.class_name || labels.emptyDash}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {labels.colDueDate}
                </dt>
                <dd className="mt-1 font-medium">{inv.due_date}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {labels.colFeeType}
                </dt>
                <dd className="mt-1 font-medium">
                  {inv.fee_structure_name ||
                    inv.description ||
                    labels.emptyDash}
                </dd>
              </div>
            </dl>

            <table className="mt-6 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-left">
                  <th className="py-2 pr-2 font-semibold">{labels.amount}</th>
                  <th className="py-2 pr-2 font-semibold">{labels.paid}</th>
                  <th className="py-2 pr-2 font-semibold">{labels.balance}</th>
                  <th className="py-2 font-semibold">{labels.status}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-2">{money(inv.amount)}</td>
                  <td className="py-3 pr-2">{money(inv.amount_paid)}</td>
                  <td className="py-3 pr-2 text-lg font-bold">
                    {money(inv.balance)}
                  </td>
                  <td className="py-3">{statusLabel(inv)}</td>
                </tr>
              </tbody>
            </table>

            <p className="mt-6 text-sm text-stone-700">{labels.pleaseSettle}</p>
            <p className="mt-8 text-xs text-stone-500">{labels.invoiceFooter}</p>
          </article>
        ))}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          [data-print-target="invoices"] .outstanding-invoices,
          [data-print-target="invoices"] .outstanding-invoices * {
            visibility: visible;
          }
          [data-print-target="invoices"] .outstanding-invoices {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .invoice-doc:last-child {
            break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
