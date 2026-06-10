import { createClient } from "@/lib/supabase/server";

export type PaymentListItem = {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  reference: string | null;
  paid_at: string;
  student_name: string;
  student_code: string;
  invoice_amount: number;
};

export async function getPayments(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<PaymentListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("fee_payments")
    .select(`
      id,
      invoice_id,
      amount,
      method,
      reference,
      paid_at,
      fee_invoices(
        amount,
        students(
          first_name,
          last_name,
          student_id,
          school_id,
          branch_id
        )
      )
    `)
    .order("paid_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("getPayments error:", error);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const invoice = row.fee_invoices as {
        amount?: number;
        students?: {
          first_name?: string;
          last_name?: string;
          student_id?: string;
          school_id?: string;
          branch_id?: string;
        } | null;
      } | null;
      const student = invoice?.students;
      return {
        id: row.id,
        invoice_id: row.invoice_id,
        amount: Number(row.amount),
        method: row.method ?? "other",
        reference: row.reference,
        paid_at: row.paid_at,
        student_name: student
          ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()
          : "—",
        student_code: student?.student_id ?? "—",
        invoice_amount: Number(invoice?.amount ?? 0),
        _school_id: student?.school_id,
        _branch_id: student?.branch_id,
      };
    })
    .filter((row) => {
      if (options?.schoolId && row._school_id !== options.schoolId) return false;
      if (options?.branchId && row._branch_id !== options.branchId) return false;
      return true;
    })
    .map(({ _school_id: _s, _branch_id: _b, ...item }) => item);
}

export async function getMonthlyPaymentTotals(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<Record<string, number>> {
  const payments = await getPayments(options);
  const totals: Record<string, number> = {};
  for (const payment of payments) {
    const month = payment.paid_at.slice(0, 7);
    totals[month] = (totals[month] ?? 0) + payment.amount;
  }
  return totals;
}
