"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  selectAll: string;
  clearSelection: string;
  selectedCount: string;
  printOfficeList: string;
  printParentNotices: string;
  noOutstanding: string;
  noOutstandingDesc: string;
  noSelection: string;
  colStudentId: string;
  colStudent: string;
  colClass: string;
  colFeeType: string;
  colDueDate: string;
  amount: string;
  paid: string;
  balance: string;
  status: string;
  overdue: string;
  pending: string;
  officeListTitle: string;
  issuedOn: string;
  debtNoticeTitle: string;
  pleaseSettle: string;
  totalBalance: string;
  parentSlipFooter: string;
  emptyDash: string;
  classLabel: string;
};

type PrintTarget = "list" | "slips";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printTarget, setPrintTarget] = useState<PrintTarget>("list");
  const [printPending, setPrintPending] = useState(false);

  useEffect(() => {
    if (!printPending) return;
    const timer = window.setTimeout(() => {
      window.print();
      setPrintPending(false);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [printPending, printTarget]);

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

  const selectedGroups = useMemo(
    () => groups.filter((g) => selected.has(g.student_uuid || g.student_id)),
    [groups, selected]
  );

  const money = (value: number) => formatMoney(value, currencyCode);

  function studentKey(group: OutstandingStudentGroup) {
    return group.student_uuid || group.student_id;
  }

  function toggleStudent(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(groups.map(studentKey)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function printOfficeList() {
    setPrintTarget("list");
    setPrintPending(true);
  }

  function printParentNotices() {
    if (selectedGroups.length === 0) {
      window.alert(labels.noSelection);
      return;
    }
    setPrintTarget("slips");
    setPrintPending(true);
  }

  function statusLabel(inv: InvoiceListItem) {
    const today = new Date(new Date().toDateString());
    const overdue =
      inv.status === "overdue" ||
      (inv.status === "pending" && new Date(inv.due_date) < today);
    return overdue ? labels.overdue : labels.pending;
  }

  return (
    <div className="space-y-6" data-print-target={printTarget}>
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            {labels.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone-500">
            {labels.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={printOfficeList}>
            <Download className="mr-1.5 h-4 w-4" />
            {labels.printOfficeList}
          </Button>
          <Button type="button" size="sm" onClick={printParentNotices}>
            <FileText className="mr-1.5 h-4 w-4" />
            {labels.printParentNotices}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 print:hidden">
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
      </div>

      <div className="flex flex-wrap items-end gap-4 print:hidden">
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

      {groups.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Button type="button" variant="ghost" size="sm" onClick={selectAllVisible}>
            {labels.selectAll}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
            {labels.clearSelection}
          </Button>
          <p className="text-sm text-stone-500">
            {selected.size} {labels.selectedCount}
          </p>
        </div>
      ) : null}

      {filteredInvoices.length === 0 ? (
        <div className="print:hidden">
          <EmptyState
            title={labels.noOutstanding}
            description={labels.noOutstandingDesc}
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700 print:hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-stone-50 text-left dark:bg-stone-800/60">
              <tr>
                <th className="px-3 py-2 font-medium" />
                <th className="px-3 py-2 font-medium">{labels.colStudentId}</th>
                <th className="px-3 py-2 font-medium">{labels.colStudent}</th>
                <th className="px-3 py-2 font-medium">{labels.colClass}</th>
                <th className="px-3 py-2 font-medium">{labels.colFeeType}</th>
                <th className="px-3 py-2 font-medium">{labels.amount}</th>
                <th className="px-3 py-2 font-medium">{labels.paid}</th>
                <th className="px-3 py-2 font-medium">{labels.balance}</th>
                <th className="px-3 py-2 font-medium">{labels.colDueDate}</th>
                <th className="px-3 py-2 font-medium">{labels.status}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const key = inv.student_uuid || inv.student_id;
                return (
                  <tr
                    key={inv.id}
                    className="border-t border-stone-100 dark:border-stone-800"
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(key)}
                        onChange={() => toggleStudent(key)}
                        aria-label={inv.student_name}
                      />
                    </td>
                    <td className="px-3 py-2">{inv.student_id || labels.emptyDash}</td>
                    <td className="px-3 py-2 font-medium">{inv.student_name}</td>
                    <td className="px-3 py-2">
                      {inv.class_name || labels.emptyDash}
                    </td>
                    <td className="px-3 py-2">
                      {inv.fee_structure_name || inv.description || labels.emptyDash}
                    </td>
                    <td className="px-3 py-2">{money(inv.amount)}</td>
                    <td className="px-3 py-2">{money(inv.amount_paid)}</td>
                    <td className="px-3 py-2 font-semibold text-amber-700 dark:text-amber-400">
                      {money(inv.balance)}
                    </td>
                    <td className="px-3 py-2">{inv.due_date}</td>
                    <td className="px-3 py-2">{statusLabel(inv)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Office list - print target */}
      <article className="outstanding-office-list hidden print:block">
        <header className="mb-6 flex items-start justify-between gap-4 border-b border-stone-300 pb-4">
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
                {labels.officeListTitle}
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {school?.name ?? labels.title}
              </h2>
              {school?.address ? (
                <p className="mt-1 text-sm text-stone-500">{school.address}</p>
              ) : null}
            </div>
          </div>
          <div className="text-right text-sm text-stone-500">
            <p>
              {labels.issuedOn}: {issuedOn}
            </p>
            <p className="mt-1">
              {labels.studentsWithDebt}: {groups.length}
            </p>
            <p>
              {labels.totalOwed}: {money(totalOwed)}
            </p>
          </div>
        </header>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-300 text-left">
              <th className="py-2 pr-2 font-semibold">{labels.colStudentId}</th>
              <th className="py-2 pr-2 font-semibold">{labels.colStudent}</th>
              <th className="py-2 pr-2 font-semibold">{labels.colClass}</th>
              <th className="py-2 pr-2 font-semibold">{labels.colFeeType}</th>
              <th className="py-2 pr-2 font-semibold">{labels.balance}</th>
              <th className="py-2 pr-2 font-semibold">{labels.colDueDate}</th>
              <th className="py-2 font-semibold">{labels.status}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="border-b border-stone-200">
                <td className="py-2 pr-2">{inv.student_id || labels.emptyDash}</td>
                <td className="py-2 pr-2">{inv.student_name}</td>
                <td className="py-2 pr-2">{inv.class_name || labels.emptyDash}</td>
                <td className="py-2 pr-2">
                  {inv.fee_structure_name || inv.description || labels.emptyDash}
                </td>
                <td className="py-2 pr-2 font-semibold">{money(inv.balance)}</td>
                <td className="py-2 pr-2">{inv.due_date}</td>
                <td className="py-2">{statusLabel(inv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {/* Parent debt slips - print target */}
      <div className="outstanding-parent-slips hidden print:block">
        {selectedGroups.map((group) => (
          <article
            key={studentKey(group)}
            className="debt-slip break-after-page mb-8 border border-stone-300 p-8 print:mb-0 print:break-after-page print:border-0 print:p-0"
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
                    {labels.debtNoticeTitle}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    {school?.name ?? labels.title}
                  </h2>
                  {school?.address ? (
                    <p className="mt-1 text-sm text-stone-500">{school.address}</p>
                  ) : null}
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
                <dd className="mt-1 text-lg font-semibold">{group.student_name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {labels.colStudentId}
                </dt>
                <dd className="mt-1 font-medium">
                  {group.student_id || labels.emptyDash}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {labels.classLabel}
                </dt>
                <dd className="mt-1 font-medium">
                  {group.class_name || labels.emptyDash}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {labels.totalBalance}
                </dt>
                <dd className="mt-1 text-xl font-bold">{money(group.total_balance)}</dd>
              </div>
            </dl>

            <table className="mt-6 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-left">
                  <th className="py-2 pr-2 font-semibold">{labels.colFeeType}</th>
                  <th className="py-2 pr-2 font-semibold">{labels.colDueDate}</th>
                  <th className="py-2 font-semibold">{labels.balance}</th>
                </tr>
              </thead>
              <tbody>
                {group.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-stone-200">
                    <td className="py-2 pr-2">
                      {inv.fee_structure_name || inv.description || labels.emptyDash}
                    </td>
                    <td className="py-2 pr-2">{inv.due_date}</td>
                    <td className="py-2 font-semibold">{money(inv.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-6 text-sm text-stone-700">{labels.pleaseSettle}</p>
            <p className="mt-8 text-xs text-stone-500">{labels.parentSlipFooter}</p>
          </article>
        ))}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          [data-print-target="list"] .outstanding-office-list,
          [data-print-target="list"] .outstanding-office-list *,
          [data-print-target="slips"] .outstanding-parent-slips,
          [data-print-target="slips"] .outstanding-parent-slips * {
            visibility: visible;
          }
          [data-print-target="list"] .outstanding-office-list,
          [data-print-target="slips"] .outstanding-parent-slips {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .debt-slip:last-child {
            break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
