"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { markPayrollPaid } from "@/lib/actions/payroll";
import { toast } from "@/lib/toast";
import { UserAvatar } from "@/components/layout/user-avatar";

interface PayrollRowActionsProps {
  row: {
    id: string;
    staff_name: string;
    staff_position: string | null;
    staff_department: string | null;
    staff_photo_url: string | null;
    amount: number;
    status: "pending" | "paid";
    payment_date: string | null;
    payment_method: "cash" | "bank" | "mobile_money" | null;
    reference_number: string | null;
    notes: string | null;
  };
}

export function PayrollRowActions({ row }: PayrollRowActionsProps) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const router = useRouter();
  const [viewOpen, setViewOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(String(row.amount));
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank" | "mobile_money">(
    "cash"
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const methodLabel =
    row.payment_method === "cash"
      ? t("methodCash")
      : row.payment_method === "bank"
        ? t("methodBank")
        : row.payment_method === "mobile_money"
          ? t("methodMobileMoney")
          : null;

  async function handlePay() {
    setLoading(true);
    const result = await markPayrollPaid(row.id, {
      amount: Number(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber || undefined,
      notes: notes || undefined,
    });
    setLoading(false);

    if (result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("markPaidFailed")
      );
      return;
    }

    toast.success(t("payrollMarkedPaid"));
    setPayOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setViewOpen(true)}>
          {t("viewAction")}
        </Button>
        {row.status === "pending" ? (
          <Button size="sm" variant="ghost" onClick={() => setPayOpen(true)}>
            {t("payAction")}
          </Button>
        ) : null}
      </div>

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={t("payrollDetails")}>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <UserAvatar name={row.staff_name} avatarUrl={row.staff_photo_url} />
            <div>
              <p className="font-semibold">{row.staff_name}</p>
              <p className="text-stone-500">{row.staff_position ?? t("colStaff")}</p>
            </div>
          </div>
          <p><span className="font-medium">{t("departmentLabel")}:</span> {row.staff_department ?? tc("emptyDash")}</p>
          <p><span className="font-medium">{t("monthlySalary")}:</span> {row.amount.toLocaleString()}</p>
          <p><span className="font-medium">{tc("status")}:</span> {row.status === "paid" ? t("statusPaid") : t("statusPending")}</p>
          <p><span className="font-medium">{t("paymentDateLabel")}:</span> {row.payment_date ?? tc("emptyDash")}</p>
          <p><span className="font-medium">{t("paymentMethodLabel")}:</span> {methodLabel ?? tc("emptyDash")}</p>
          <p><span className="font-medium">{t("referenceNumberLabel")}:</span> {row.reference_number ?? tc("emptyDash")}</p>
          <p><span className="font-medium">{tc("notes")}:</span> {row.notes ?? tc("emptyDash")}</p>
        </div>
      </Modal>

      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title={t("payStaffTitle", { name: row.staff_name })}>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`amount-${row.id}`}>{tc("amount")}</Label>
            <Input
              id={`amount-${row.id}`}
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`date-${row.id}`}>{t("paymentDateLabel")}</Label>
            <Input
              id={`date-${row.id}`}
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`method-${row.id}`}>{t("paymentMethodLabel")}</Label>
            <select
              id={`method-${row.id}`}
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as "cash" | "bank" | "mobile_money")
              }
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              <option value="cash">{t("methodCash")}</option>
              <option value="bank">{t("methodBank")}</option>
              <option value="mobile_money">{t("methodMobileMoney")}</option>
            </select>
          </div>
          <div>
            <Label htmlFor={`reference-${row.id}`}>{t("referenceNumberLabel")}</Label>
            <Input
              id={`reference-${row.id}`}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={tc("optional")}
            />
          </div>
          <div>
            <Label htmlFor={`notes-${row.id}`}>{tc("notes")}</Label>
            <textarea
              id={`notes-${row.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tc("optional")}
              className="min-h-20 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPayOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handlePay} disabled={loading}>
              {t("markAsPaid")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
