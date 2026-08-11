import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getExpenseReceipt, getSchoolCurrencyForSchool } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/rbac";
import { formatMoney } from "@/lib/currency";
import { getTranslations } from "next-intl/server";
import { PrintReceiptButton } from "./print-button";

function schoolInitials(name: string | null | undefined) {
  if (!name?.trim()) return "S";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "S";
}

export default async function ExpenseReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const pathname = `/finance/expenses/${id}/receipt`;
  if (!canAccessPath(profile.role, pathname)) {
    redirect("/");
  }

  const t = await getTranslations("finance");
  const receipt = await getExpenseReceipt(id);
  if (!receipt) notFound();

  if (receipt.status !== "approved" || !receipt.receipt_number) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10">
        <h1 className="text-xl font-semibold">{t("receiptUnavailableTitle")}</h1>
        <p className="text-sm text-stone-500">{t("receiptUnavailableDesc")}</p>
        <Link href="/finance/expenses" className="text-sm text-blue-600 hover:underline">
          {t("backToExpenses")}
        </Link>
      </div>
    );
  }

  const currency = await getSchoolCurrencyForSchool(
    receipt.school_id ?? profile.school_id
  );
  const amount = formatMoney(receipt.amount, currency.code);
  const issuedOn = receipt.approved_at
    ? receipt.approved_at.slice(0, 10)
    : receipt.date;
  const schoolName = receipt.school_name ?? t("expensesTitle");

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/finance/expenses"
          className="text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
        >
          {t("backToExpenses")}
        </Link>
        <PrintReceiptButton label={t("printReceipt")} />
      </div>

      <article className="expense-receipt rounded-xl border border-stone-200 bg-white p-8 text-stone-900 shadow-sm dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100">
        <header className="border-b border-stone-200 pb-4 dark:border-stone-700">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900">
              {receipt.school_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={receipt.school_logo_url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-lg font-bold tracking-wide text-stone-600 dark:text-stone-300">
                  {schoolInitials(receipt.school_name)}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {t("expenseReceiptLabel")}
              </p>
              <h1 className="mt-2 text-2xl font-bold">{schoolName}</h1>
              <p className="mt-1 text-sm text-stone-500">
                {t("receiptNumberLabel", { number: receipt.receipt_number })}
              </p>
            </div>
          </div>
        </header>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              {t("colCategory")}
            </dt>
            <dd className="mt-1 font-medium">{receipt.category}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              {t("colAmount")}
            </dt>
            <dd className="mt-1 text-xl font-semibold">{amount}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              {t("expenseDate")}
            </dt>
            <dd className="mt-1 font-medium">{receipt.date}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              {t("issuedOn")}
            </dt>
            <dd className="mt-1 font-medium">{issuedOn}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              {t("colDescription")}
            </dt>
            <dd className="mt-1 font-medium">{receipt.description || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              {t("submittedBy")}
            </dt>
            <dd className="mt-1 font-medium">
              {receipt.created_by_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              {t("approvedBy")}
            </dt>
            <dd className="mt-1 font-medium">
              {receipt.approved_by_name ?? "—"}
            </dd>
          </div>
        </dl>

        <footer className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-500 dark:border-stone-700">
          <p>{t("receiptFooter")}</p>
        </footer>
      </article>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .expense-receipt, .expense-receipt * { visibility: visible; }
          .expense-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
