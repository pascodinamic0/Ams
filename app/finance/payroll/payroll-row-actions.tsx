"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        typeof result.error === "string" ? result.error : "Failed to mark payroll as paid"
      );
      return;
    }

    toast.success("Payroll marked as paid");
    setPayOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setViewOpen(true)}>
          View
        </Button>
        {row.status === "pending" ? (
          <Button size="sm" variant="ghost" onClick={() => setPayOpen(true)}>
            Pay
          </Button>
        ) : null}
      </div>

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Payroll details">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <UserAvatar name={row.staff_name} avatarUrl={row.staff_photo_url} />
            <div>
              <p className="font-semibold">{row.staff_name}</p>
              <p className="text-stone-500">{row.staff_position ?? "Staff"}</p>
            </div>
          </div>
          <p><span className="font-medium">Department:</span> {row.staff_department ?? "-"}</p>
          <p><span className="font-medium">Monthly Salary:</span> {row.amount.toLocaleString()}</p>
          <p><span className="font-medium">Status:</span> {row.status === "paid" ? "Paid" : "Pending"}</p>
          <p><span className="font-medium">Payment Date:</span> {row.payment_date ?? "-"}</p>
          <p><span className="font-medium">Payment Method:</span> {row.payment_method ?? "-"}</p>
          <p><span className="font-medium">Reference Number:</span> {row.reference_number ?? "-"}</p>
          <p><span className="font-medium">Notes:</span> {row.notes ?? "-"}</p>
        </div>
      </Modal>

      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title={`Pay ${row.staff_name}`}>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`amount-${row.id}`}>Amount</Label>
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
            <Label htmlFor={`date-${row.id}`}>Payment Date</Label>
            <Input
              id={`date-${row.id}`}
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`method-${row.id}`}>Payment Method</Label>
            <select
              id={`method-${row.id}`}
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as "cash" | "bank" | "mobile_money")
              }
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
          <div>
            <Label htmlFor={`reference-${row.id}`}>Reference Number</Label>
            <Input
              id={`reference-${row.id}`}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label htmlFor={`notes-${row.id}`}>Notes</Label>
            <textarea
              id={`notes-${row.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="min-h-20 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePay} disabled={loading}>
              Mark as Paid
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
