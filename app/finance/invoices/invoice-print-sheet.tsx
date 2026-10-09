"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/currency";
import type { InvoiceListItem, InvoicePaymentLine } from "@/lib/db/invoices";

const PAYMENT_METHOD_KEYS: Record<string, string> = {
  cash: "cash",
  bank_transfer: "bankTransfer",
  mobile_money: "mobileMoney",
  card: "card",
  online: "online",
  other: "other",
};

type SchoolInfo = {
  name: string;
  logo_url: string | null;
  address: string | null;
};

function isOverdue(inv: InvoiceListItem) {
  if (inv.status === "paid") return false;
  if (inv.status === "overdue") return true;
  return new Date(inv.due_date) < new Date(new Date().toDateString());
}

export function InvoicePrintSheet({
  invoices,
  school,
  currencyCode,
  issuedOn,
}: {
  invoices: InvoiceListItem[];
  school: SchoolInfo | null;
  currencyCode: string;
  issuedOn: string;
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const locale = useLocale();
  const money = (value: number) => formatMoney(value, currencyCode);
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  function methodLabel(method: string) {
    const key = PAYMENT_METHOD_KEYS[method];
    return key && t.has(key) ? t(key) : method || tc("emptyDash");
  }

  function paidAtLabel(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value || tc("emptyDash");
    return new Intl.DateTimeFormat(dateLocale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function historyLines(inv: InvoiceListItem): InvoicePaymentLine[] {
    const payments = inv.payments ?? [];
    if (payments.length > 0) return payments;
    if (inv.amount_paid <= 0) return [];
    return [
      {
        id: `${inv.id}-paid`,
        amount: inv.amount_paid,
        method: "",
        reference: null,
        paid_at: "",
      },
    ];
  }

  function statusLabel(inv: InvoiceListItem) {
    if (inv.status === "paid") return tc("paid");
    return isOverdue(inv) ? tc("overdue") : tc("pending");
  }

  if (invoices.length === 0) return null;

  return (
    <div className="invoice-print-sheet hidden print:block">
      {invoices.map((inv) => (
        <article
          key={inv.id}
          className="invoice-doc mb-8 break-after-page border border-stone-300 p-8 print:mb-0 print:break-after-page print:border-0 print:p-0"
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
                  {t("invoiceDocumentTitle")}
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {school?.name ?? t("invoicesTitle")}
                </h2>
                {school?.address ? (
                  <p className="mt-1 text-sm text-stone-500">{school.address}</p>
                ) : null}
                <p className="mt-2 text-sm text-stone-500">
                  {t("invoiceNumberLabel")}: {inv.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <p className="text-sm text-stone-500">
              {t("budgetIssuedOn")}: {issuedOn}
            </p>
          </header>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                {t("colStudent")}
              </dt>
              <dd className="mt-1 text-lg font-semibold">{inv.student_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                {t("colStudentId")}
              </dt>
              <dd className="mt-1 font-medium">{inv.student_id || tc("emptyDash")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                {t("colClass")}
              </dt>
              <dd className="mt-1 font-medium">{inv.class_name || tc("emptyDash")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                {t("colDueDate")}
              </dt>
              <dd className="mt-1 font-medium">{inv.due_date}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                {t("colFeeType")}
              </dt>
              <dd className="mt-1 font-medium">
                {inv.fee_structure_name || inv.description || tc("emptyDash")}
              </dd>
            </div>
          </dl>

          <table className="mt-6 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-left">
                <th className="py-2 pr-2 font-semibold">{t("colFullYear")}</th>
                <th className="py-2 pr-2 font-semibold">{tc("paid")}</th>
                <th className="py-2 pr-2 font-semibold">{t("colFacture")}</th>
                <th className="py-2 font-semibold">{tc("status")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-200">
                <td className="py-3 pr-2">{money(inv.amount)}</td>
                <td className="py-3 pr-2">{money(inv.amount_paid)}</td>
                <td className="py-3 pr-2 text-lg font-bold">{money(inv.balance)}</td>
                <td className="py-3">{statusLabel(inv)}</td>
              </tr>
            </tbody>
          </table>

          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {t("paymentHistory")}
            </h3>
            {historyLines(inv).length === 0 ? (
              <p className="mt-2 text-sm text-stone-600">{t("noPaymentsOnFacture")}</p>
            ) : (
              <table className="mt-2 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-stone-300 text-left">
                    <th className="py-2 pr-2 font-semibold">{t("paidAt")}</th>
                    <th className="py-2 pr-2 font-semibold">{t("paymentMethod")}</th>
                    <th className="py-2 pr-2 font-semibold">{t("reference")}</th>
                    <th className="py-2 font-semibold">{tc("amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLines(inv).map((payment) => (
                    <tr key={payment.id} className="border-b border-stone-200">
                      <td className="py-2 pr-2">{paidAtLabel(payment.paid_at)}</td>
                      <td className="py-2 pr-2">{methodLabel(payment.method)}</td>
                      <td className="py-2 pr-2">
                        {payment.reference?.trim() || tc("emptyDash")}
                      </td>
                      <td className="py-2">{money(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <p className="mt-4 text-sm text-stone-600">
            {t("factureEquals", {
              year: money(inv.amount),
              paid: money(inv.amount_paid),
            })}
          </p>
          <p className="mt-6 text-sm text-stone-700">{t("pleaseSettleDebt")}</p>
          <p className="mt-8 text-xs text-stone-500">{t("invoiceDocumentFooter")}</p>
        </article>
      ))}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          [data-print-target="invoices"] .invoice-print-sheet,
          [data-print-target="invoices"] .invoice-print-sheet * {
            visibility: visible;
          }
          [data-print-target="invoices"] .invoice-print-sheet {
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
