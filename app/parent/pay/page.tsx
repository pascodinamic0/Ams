import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getInvoiceById, getSchoolCurrencyForSchool } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { formatMoney, getSchoolCurrency } from "@/lib/currency";

export default async function ParentPayPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  const t = await getTranslations("parent");
  const params = await searchParams;
  const invoiceId = params.invoice;

  if (!invoiceId) {
    return (
      <EmptyState
        title={t("noInvoiceSelected")}
        description={t("noInvoiceSelectedDesc")}
        action={
          <Link href="/parent/fees">
            <Button>{t("viewFees")}</Button>
          </Link>
        }
      />
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescContinue")} />
    );
  }

  const { data: guardian } = await supabase
    .from("guardians")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!guardian) {
    return (
      <EmptyState
        title={t("noGuardianProfile")}
        description={t("noGuardianProfileDescShort")}
      />
    );
  }

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    return (
      <EmptyState title={t("invoiceNotFound")} description={t("invoiceNotFoundDesc")} />
    );
  }

  const student = invoice.students as {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string | null;
    school_id: string;
  } | null;

  const { data: link } = await supabase
    .from("guardian_students")
    .select("student_id")
    .eq("guardian_id", guardian.id)
    .eq("student_id", student?.id ?? "")
    .maybeSingle();

  if (!link) {
    return (
      <EmptyState
        title={t("accessDenied")}
        description={t("accessDeniedDesc")}
      />
    );
  }

  const { data: school } = await supabase
    .from("schools")
    .select("name, contact_email, contact_phone, address, currency_code")
    .eq("id", student?.school_id ?? "")
    .single();

  const currency = getSchoolCurrency(school?.currency_code);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);

  const amount = Number(invoice.amount);
  const amountPaid = Number(invoice.amount_paid ?? 0);
  const balance = Math.max(0, amount - amountPaid);
  const studentName = student
    ? `${student.first_name} ${student.last_name}`.trim()
    : t("studentFallback");

  if (balance <= 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("payment")}</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-stone-600">{t("invoiceFullyPaid")}</p>
            <Link href="/parent/fees" className="mt-4 inline-block">
              <Button variant="ghost">{t("backToFees")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("payFees")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("manualPaymentNote")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("invoiceSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-stone-500">{t("labelStudent")}</span> {studentName}{student?.student_id ? ` (${student.student_id})` : ""}</p>
          <p><span className="text-stone-500">{t("labelDescription")}</span> {invoice.description ?? t("schoolFees")}</p>
          <p><span className="text-stone-500">{t("labelDueDate")}</span> {invoice.due_date}</p>
          <p><span className="text-stone-500">{t("labelTotal")}</span> {formatCurrency(amount)}</p>
          <p><span className="text-stone-500">{t("labelPaid")}</span> {formatCurrency(amountPaid)}</p>
          <p className="text-lg font-semibold">
            <span className="text-stone-500 font-normal">{t("labelAmountDue")}</span> {formatCurrency(balance)}
          </p>
          <p className="text-stone-500">{t("labelReference")} <span className="font-mono text-stone-900 dark:text-white">{invoice.id.slice(0, 8).toUpperCase()}</span></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("howToPay")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-stone-600">
          <ol className="list-decimal space-y-2 pl-5">
            <li>{t("payStep1", { amount: formatCurrency(balance) })}</li>
            <li>
              {t("payStep2", {
                ref: invoice.id.slice(0, 8).toUpperCase(),
                name: studentName,
              })}
            </li>
            <li>
              {t("payStep3Prefix")}{" "}
              {school?.contact_email ? (
                <a href={`mailto:${school.contact_email}`} className="text-primary underline">
                  {school.contact_email}
                </a>
              ) : (
                t("financeOffice")
              )}
              {school?.contact_phone ? ` ${t("payStep3OrCall", { phone: school.contact_phone })}` : ""}.
            </li>
            <li>{t("payStep4")}</li>
          </ol>
          {school?.address && (
            <p className="border-t pt-4 text-stone-500">
              {school.name} - {school.address}
            </p>
          )}
        </CardContent>
      </Card>

      <Link href="/parent/fees">
        <Button variant="ghost">{t("backToFees")}</Button>
      </Link>
    </div>
  );
}
