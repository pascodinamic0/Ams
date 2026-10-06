"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  ensurePendingPayrollLine,
  markPayrollPaid,
  setPendingPayrollAmount,
  setStaffPayrollMonthInclusion,
} from "@/lib/actions/payroll";
import { toast } from "@/lib/toast";
import { UserAvatar } from "@/components/layout/user-avatar";

interface PayrollRowActionsProps {
  compact?: boolean;
  row: {
    id: string;
    staff_id: string;
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
    payroll_month: number;
    payroll_year: number;
  };
  schoolId?: string;
}

export function PayrollRowActions({ row, schoolId, compact = false }: PayrollRowActionsProps) {
  const router = useRouter();
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const [viewOpen, setViewOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [amountOpen, setAmountOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(String(row.amount));
  const [editAmount, setEditAmount] = useState(String(row.amount));
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank" | "mobile_money">(
    "cash"
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const fieldId = row.id || row.staff_id;

  const paymentMethodLabel =
    row.payment_method === "cash"
      ? t("cash")
      : row.payment_method === "bank"
        ? t("bank")
        : row.payment_method === "mobile_money"
          ? t("mobileMoney")
          : "-";

  async function handlePay() {
    setLoading(true);
    let payrollId = row.id;
    if (!payrollId) {
      if (!schoolId) {
        setLoading(false);
        toast.error(te("schoolRequiredExcludePayroll"));
        return;
      }
      const created = await ensurePendingPayrollLine({
        staffId: row.staff_id,
        schoolId,
        month: row.payroll_month,
        year: row.payroll_year,
        amount: Number(amount),
      });
      if ("error" in created && created.error) {
        setLoading(false);
        toast.error(created.error);
        return;
      }
      payrollId = "data" in created ? created.data?.id ?? "" : "";
      if (!payrollId) {
        setLoading(false);
        toast.error(t("payrollMarkPaidFailed"));
        return;
      }
    }

    const result = await markPayrollPaid(payrollId, {
      amount: Number(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber || undefined,
      notes: notes || undefined,
    });
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("payrollMarkPaidFailed")
      );
      return;
    }

    toast.success(t("payrollMarkedPaid"));
    setPayOpen(false);
    router.refresh();
  }

  async function handleSetAmount() {
    setLoading(true);
    const result = await setPendingPayrollAmount(row.id, Number(editAmount));
    setLoading(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("payAmountUpdated"));
    setAmount(editAmount);
    setAmountOpen(false);
    router.refresh();
  }

  async function handleExclude() {
    if (!schoolId) {
      toast.error(te("schoolRequiredExcludePayroll"));
      return;
    }
    if (!window.confirm(t("excludeFromPayrollConfirm", { name: row.staff_name }))) {
      return;
    }

    setLoading(true);
    const result = await setStaffPayrollMonthInclusion({
      staffId: row.staff_id,
      schoolId,
      month: row.payroll_month,
      year: row.payroll_year,
      included: false,
    });
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("excludedFromPayroll", { name: row.staff_name }));
    router.refresh();
  }

  return (
    <>
      <div className={compact ? "flex flex-nowrap gap-1" : "flex flex-wrap gap-2"}>
        <Button size="sm" variant="ghost" onClick={() => setViewOpen(true)}>
          {tc("view")}
        </Button>
        {row.status === "pending" && !compact ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditAmount(String(row.amount));
              setAmountOpen(true);
            }}
          >
            {t("setAmount")}
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          disabled={row.status === "paid" || loading}
          onClick={() => {
            setAmount(String(row.amount));
            setPayOpen(true);
          }}
        >
          {t("pay")}
        </Button>
        {row.status === "pending" && schoolId && !compact ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExclude}
            disabled={loading}
          >
            {t("dontPay")}
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
          <p><span className="font-medium">{t("department")}:</span> {row.staff_department ?? "-"}</p>
          <p><span className="font-medium">{t("monthlySalary")}:</span> {row.amount.toLocaleString()}</p>
          <p><span className="font-medium">{tc("status")}:</span> {!row.id ? t("notGenerated") : row.status === "paid" ? t("statusPaid") : t("statusPending")}</p>
          <p><span className="font-medium">{t("paymentDate")}:</span> {row.payment_date ?? "-"}</p>
          <p><span className="font-medium">{t("paymentMethod")}:</span> {paymentMethodLabel}</p>
          <p><span className="font-medium">{t("referenceNumber")}:</span> {row.reference_number ?? "-"}</p>
          <p><span className="font-medium">{tc("notes")}:</span> {row.notes ?? "-"}</p>
        </div>
      </Modal>

      <Modal
        isOpen={amountOpen}
        onClose={() => setAmountOpen(false)}
        title={t("setAmountFor", { name: row.staff_name })}
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor={`edit-amount-${fieldId}`}>{t("amountToPay")}</Label>
            <Input
              id={`edit-amount-${fieldId}`}
              type="number"
              min="0"
              step="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setAmountOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleSetAmount} disabled={loading}>
              {t("saveAmount")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title={t("payStaff", { name: row.staff_name })}>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`amount-${fieldId}`}>{tc("amount")}</Label>
            <Input
              id={`amount-${fieldId}`}
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`date-${fieldId}`}>{t("paymentDate")}</Label>
            <Input
              id={`date-${fieldId}`}
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`method-${fieldId}`}>{t("paymentMethod")}</Label>
            <select
              id={`method-${fieldId}`}
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as "cash" | "bank" | "mobile_money")
              }
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              <option value="cash">{t("cash")}</option>
              <option value="bank">{t("bank")}</option>
              <option value="mobile_money">{t("mobileMoney")}</option>
            </select>
          </div>
          <div>
            <Label htmlFor={`reference-${fieldId}`}>{t("referenceNumber")}</Label>
            <Input
              id={`reference-${fieldId}`}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={tc("optional")}
            />
          </div>
          <div>
            <Label htmlFor={`notes-${fieldId}`}>{tc("notes")}</Label>
            <textarea
              id={`notes-${fieldId}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tc("optional")}
              className="min-h-20 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
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
