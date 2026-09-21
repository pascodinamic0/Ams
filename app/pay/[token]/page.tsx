import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicInvoicePayment } from "@/lib/db/payment-links";
import { formatMoney, getSchoolCurrency } from "@/lib/currency";
import { isValidPaymentToken } from "@/lib/payments/payment-links";
import { companyIdentity } from "@/lib/company/identity";
import { buildPageMetadata } from "@/lib/company/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const t = await getTranslations("pay");
  const { token } = await params;
  const invoice = isValidPaymentToken(token)
    ? await getPublicInvoicePayment(token)
    : null;

  return {
    ...buildPageMetadata({
      title: invoice
        ? `${t("title")} - ${invoice.school_name}`
        : `${t("title")} | ${companyIdentity.productName}`,
      description: t("subtitle"),
      path: `/pay/${token}`,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function PublicPayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const t = await getTranslations("pay");
  const { token } = await params;

  if (!isValidPaymentToken(token)) {
    return (
      <EmptyState title={t("invalidLink")} description={t("invalidLinkDesc")} />
    );
  }

  const invoice = await getPublicInvoicePayment(token);
  if (!invoice) {
    return (
      <EmptyState title={t("notFound")} description={t("notFoundDesc")} />
    );
  }

  const currency = getSchoolCurrency(invoice.currency_code);
  const amount = invoice.amount;
  const amountPaid = invoice.amount_paid;
  const balance = Math.max(0, amount - amountPaid);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);
  const studentLabel = invoice.student_code
    ? `${invoice.student_name} (${invoice.student_code})`
    : invoice.student_name;

  if (balance <= 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-stone-600 dark:text-stone-300">{t("alreadyPaid")}</p>
            <p className="mt-2 text-sm text-stone-500">
              {studentLabel} - {invoice.school_name}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">{invoice.school_name}</p>
        <h1 className="mt-1 text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("amountDue")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</p>
          <p>
            <span className="text-stone-500">{t("labelStudent")}</span> {studentLabel}
          </p>
          <p>
            <span className="text-stone-500">{t("labelDescription")}</span>{" "}
            {invoice.description ?? t("schoolFees")}
          </p>
          <p>
            <span className="text-stone-500">{t("labelDueDate")}</span> {invoice.due_date}
          </p>
          <p>
            <span className="text-stone-500">{t("labelTotal")}</span> {formatCurrency(amount)}
          </p>
          <p>
            <span className="text-stone-500">{t("labelPaid")}</span> {formatCurrency(amountPaid)}
          </p>
          <p className="text-stone-500">
            {t("labelReference")}{" "}
            <span className="font-mono text-stone-900 dark:text-white">{invoice.invoice_ref}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("howToPay")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-stone-600 dark:text-stone-300">
          <ol className="list-decimal space-y-2 pl-5">
            <li>{t("payStep1", { amount: formatCurrency(balance) })}</li>
            <li>
              {t("payStep2", {
                ref: invoice.invoice_ref,
                name: invoice.student_name,
              })}
            </li>
            <li>
              {t("payStep3Prefix")}{" "}
              {invoice.contact_email ? (
                <a href={`mailto:${invoice.contact_email}`} className="text-primary underline">
                  {invoice.contact_email}
                </a>
              ) : (
                t("financeOffice")
              )}
              {invoice.contact_phone
                ? ` ${t("payStep3OrCall", { phone: invoice.contact_phone })}`
                : ""}
              .
            </li>
            <li>{t("payStep4")}</li>
          </ol>
          {invoice.address ? (
            <p className="border-t border-stone-200 pt-4 text-stone-500 dark:border-stone-800">
              {invoice.school_name} - {invoice.address}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
