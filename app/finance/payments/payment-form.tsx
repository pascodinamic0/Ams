"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function onSubmit(data: PaymentFormData) {
    const result = await recordPayment(data);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to record payment");
      return;
    }
    toast.success("Payment recorded");
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
  const { register, formState: { errors } } = useFormContext<PaymentFormData>();

  return (
    <>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="invoice_id" required>Invoice</Label>
        <select
          id="invoice_id"
          {...register("invoice_id")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">Select invoice</option>
          {openInvoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.label} - balance {inv.balance.toFixed(2)}
            </option>
          ))}
        </select>
        {errors.invoice_id && <p className="mt-1 text-sm text-red-500">{errors.invoice_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="amount" required>Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} error={!!errors.amount} />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div>
        <Label htmlFor="method" required>Method</Label>
        <select
          id="method"
          {...register("method")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="card">Card</option>
          <option value="mobile_money">Mobile money</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <Label htmlFor="reference">Reference</Label>
        <Input id="reference" {...register("reference")} placeholder="Receipt or transaction ID" />
      </div>
      <div>
        <Label htmlFor="paid_at">Paid at</Label>
        <Input id="paid_at" type="datetime-local" {...register("paid_at")} />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">Record payment</Button>
      </div>
    </>
  );
}
