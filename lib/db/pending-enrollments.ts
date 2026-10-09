import { createClient } from "@/lib/supabase/server";
import {
  deriveEnrollmentInvoiceStatus,
  pendingEnrollmentInvoiceAmount,
  roundMoney,
} from "@/lib/services/enrollment-fees";
import { formatStudentName } from "@/lib/utils";

export type PendingEnrollmentInvoice = {
  invoice_id: string;
  amount: number;
  paid: number;
  balance: number;
  fee_structure_name: string | null;
  status: string | null;
  due_date: string | null;
};

export type PendingEnrollmentRow = {
  student_id: string;
  student_number: string | null;
  student_name: string;
  class_name: string | null;
  enrollment_receipt_ref: string | null;
  onboarded_at: string;
  invoice_amount: number;
  invoice_paid: number;
  invoice_balance: number;
  invoices: PendingEnrollmentInvoice[];
};

type PendingInvoiceRecord = {
  id: string;
  fee_structure_id: string | null;
  amount: number | string;
  amount_paid: number | string | null;
  status: string | null;
  due_date: string | null;
  fee_structures: { name?: string; amount?: number | string } | null;
};

/** Rewrite stale enrollment invoice prices to the current fee catalog. Payments stay put. */
async function alignPendingInvoicePrices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoices: PendingInvoiceRecord[]
) {
  const updates: { id: string; amount: number; status: "pending" | "paid" | "overdue" }[] = [];

  for (const invoice of invoices) {
    const catalog = invoice.fee_structures?.amount;
    if (catalog == null || !invoice.due_date) continue;
    const paid = roundMoney(Number(invoice.amount_paid ?? 0));
    const storedAmount = roundMoney(Number(invoice.amount));
    const nextAmount = pendingEnrollmentInvoiceAmount(Number(catalog), paid);
    const nextStatus = deriveEnrollmentInvoiceStatus(nextAmount, paid, invoice.due_date);
    if (storedAmount !== nextAmount || invoice.status !== nextStatus) {
      updates.push({ id: invoice.id, amount: nextAmount, status: nextStatus });
    }
    invoice.amount = nextAmount;
    invoice.status = nextStatus;
  }

  const now = new Date().toISOString();
  for (let offset = 0; offset < updates.length; offset += 20) {
    const batch = updates.slice(offset, offset + 20);
    const results = await Promise.all(
      batch.map((row) =>
        supabase
          .from("fee_invoices")
          .update({ amount: row.amount, status: row.status, updated_at: now })
          .eq("id", row.id)
      )
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      console.error("alignPendingInvoicePrices error:", failed.error);
      return;
    }
  }
}

/** A fee removed from the catalog leaves an unpaid enrollment invoice behind. Drop it. */
async function removeOrphanEnrollmentInvoices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoices: PendingInvoiceRecord[]
) {
  const orphanIds = invoices
    .filter(
      (invoice) =>
        !invoice.fee_structure_id && roundMoney(Number(invoice.amount_paid ?? 0)) === 0
    )
    .map((invoice) => invoice.id);
  if (orphanIds.length === 0) return;

  for (let offset = 0; offset < orphanIds.length; offset += 50) {
    const slice = orphanIds.slice(offset, offset + 50);
    const { error } = await supabase.from("fee_invoices").delete().in("id", slice);
    if (error) {
      console.error("removeOrphanEnrollmentInvoices error:", error);
      return;
    }
  }

  for (let index = invoices.length - 1; index >= 0; index -= 1) {
    if (orphanIds.includes(invoices[index].id)) invoices.splice(index, 1);
  }
}

export async function getPendingEnrollments(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<PendingEnrollmentRow[]> {
  const supabase = await createClient();

  let studentQuery = supabase
    .from("students")
    .select(
      `
      id,
      student_id,
      first_name,
      middle_name,
      last_name,
      enrollment_receipt_ref,
      created_at,
      class_id,
      classes(name)
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (options?.schoolId) {
    studentQuery = studentQuery.eq("school_id", options.schoolId);
  }
  if (options?.branchId) {
    studentQuery = studentQuery.eq("branch_id", options.branchId);
  }

  const { data: students, error: studentError } = await studentQuery;
  if (studentError) {
    console.error("getPendingEnrollments students error:", studentError);
    return [];
  }
  if (!students?.length) return [];

  const studentIds = students.map((s) => s.id);
  const { data: invoices, error: invoiceError } = await supabase
    .from("fee_invoices")
    .select(
      `
      id,
      student_id,
      fee_structure_id,
      amount,
      amount_paid,
      status,
      due_date,
      fee_structures(name, amount)
    `
    )
    .in("student_id", studentIds)
    .eq("source", "enrollment");

  if (invoiceError) {
    console.error("getPendingEnrollments invoices error:", invoiceError);
  }

  const invoiceRows = (invoices ?? []) as PendingInvoiceRecord[];
  await alignPendingInvoicePrices(supabase, invoiceRows);
  await removeOrphanEnrollmentInvoices(supabase, invoiceRows);

  const invoicesByStudent = new Map<string, NonNullable<typeof invoices>>();
  for (const invoice of invoices ?? []) {
    const studentId = invoice.student_id as string;
    const list = invoicesByStudent.get(studentId) ?? [];
    list.push(invoice);
    invoicesByStudent.set(studentId, list);
  }

  return students.map((s) => {
    const openInvoices = (invoicesByStudent.get(s.id) ?? [])
      .map((inv) => {
        const amount = Number(inv.amount);
        const paid = Number(inv.amount_paid ?? 0);
        const balance = Math.max(0, amount - paid);
        return {
          invoice_id: inv.id as string,
          amount,
          paid,
          balance,
          fee_structure_name:
            (inv.fee_structures as { name?: string; amount?: number } | null)?.name ?? null,
          status: (inv.status as string | null) ?? null,
          due_date: (inv.due_date as string | null) ?? null,
        };
      })
      .filter((inv) => inv.balance > 0 && inv.status !== "paid")
      .sort((a, b) => {
        const byDate = (a.due_date ?? "").localeCompare(b.due_date ?? "");
        if (byDate !== 0) return byDate;
        return (a.fee_structure_name ?? "").localeCompare(b.fee_structure_name ?? "");
      });

    return {
      student_id: s.id,
      student_number: s.student_id,
      student_name: formatStudentName(s),
      class_name: (s.classes as { name?: string } | null)?.name ?? null,
      enrollment_receipt_ref: s.enrollment_receipt_ref,
      onboarded_at: s.created_at ?? "",
      invoice_amount: openInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      invoice_paid: openInvoices.reduce((sum, inv) => sum + inv.paid, 0),
      invoice_balance: openInvoices.reduce((sum, inv) => sum + inv.balance, 0),
      invoices: openInvoices,
    };
  });
}

export async function getPendingEnrollmentCount(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (options?.schoolId) query = query.eq("school_id", options.schoolId);
  if (options?.branchId) query = query.eq("branch_id", options.branchId);

  const { count, error } = await query;
  if (error) {
    console.error("getPendingEnrollmentCount error:", error);
    return 0;
  }
  return count ?? 0;
}
