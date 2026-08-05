"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { recordPayment } from "@/lib/actions/payments";
import { paymentSchema, type PaymentFormData } from "@/lib/validations/finance";
import { toast } from "@/lib/toast";

interface Props {
  openInvoices: {
    id: string;
    label: string;
    balance: number;
  }[];
}

export function PaymentForm({ openInvoices }: Props) {
  const t = useTranslations("finance");
  const router = useRouter();

  async function onSubmit(data: PaymentFormData) {
    const result = await recordPayment(data);
    if (result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("recordPaymentFailed")
      );
      return;
    }
    toast.success(t("paymentRecorded"));
    router.refresh();
  }

  return (
    <FormWrapper
      schema={paymentSchema}
      defaultValues={{ method: "cash" }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <PaymentFormFields openInvoices={openInvoices} />
    </FormWrapper>
  );
}

function PaymentFormFields({
  openInvoices,
}: {
  openInvoices: { id: string; label: string; balance: number }[];
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const { register, formState: { errors } } = useFormContext<PaymentFormData>();

  return (
    <>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="invoice_id" required>{t("invoiceLabel")}</Label>
        <select
          id="invoice_id"
          {...register("invoice_id")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">{t("selectInvoice")}</option>
          {openInvoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.label} — {tc("balance")} {inv.balance.toFixed(2)}
            </option>
          ))}
        </select>
        {errors.invoice_id && <p className="mt-1 text-sm text-red-500">{errors.invoice_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="amount" required>{tc("amount")}</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} error={!!errors.amount} />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div>
        <Label htmlFor="method" required>{t("colMethod")}</Label>
        <select
          id="method"
          {...register("method")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="cash">{t("methodCash")}</option>
          <option value="bank_transfer">{t("methodBankTransfer")}</option>
          <option value="card">{t("methodCard")}</option>
          <option value="mobile_money">{t("methodMobileMoney")}</option>
          <option value="other">{t("methodOther")}</option>
        </select>
      </div>
      <div>
        <Label htmlFor="reference">{t("colReference")}</Label>
        <Input id="reference" {...register("reference")} placeholder={t("referencePlaceholder")} />
      </div>
      <div>
        <Label htmlFor="paid_at">{t("paidAtLabel")}</Label>
        <Input id="paid_at" type="datetime-local" {...register("paid_at")} />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">{t("recordPayment")}</Button>
      </div>
    </>
  );
}
