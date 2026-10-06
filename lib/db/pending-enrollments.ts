import { createClient } from "@/lib/supabase/server";
import { formatPersonName } from "@/lib/utils";

export type PendingEnrollmentRow = {
  student_id: string;
  student_number: string | null;
  student_name: string;
  class_name: string | null;
  enrollment_receipt_ref: string | null;
  onboarded_at: string;
  invoice_id: string | null;
  invoice_amount: number;
  invoice_paid: number;
  invoice_balance: number;
  fee_structure_name: string | null;
  invoice_status: string | null;
  due_date: string | null;
};

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
      amount,
      amount_paid,
      status,
      due_date,
      fee_structures(name)
    `
    )
    .in("student_id", studentIds)
    .eq("source", "enrollment");

  if (invoiceError) {
    console.error("getPendingEnrollments invoices error:", invoiceError);
  }

  const invoicesByStudent = new Map<string, NonNullable<typeof invoices>>();
  for (const invoice of invoices ?? []) {
    const studentId = invoice.student_id as string;
    const list = invoicesByStudent.get(studentId) ?? [];
    list.push(invoice);
    invoicesByStudent.set(studentId, list);
  }

  return students.flatMap((s) => {
    const list = invoicesByStudent.get(s.id) ?? [null];
    return list.map((inv) => {
      const amount = inv ? Number(inv.amount) : 0;
      const paid = inv ? Number(inv.amount_paid ?? 0) : 0;
      return {
        student_id: s.id,
        student_number: s.student_id,
        student_name: formatPersonName(s),
        class_name: (s.classes as { name?: string } | null)?.name ?? null,
        enrollment_receipt_ref: s.enrollment_receipt_ref,
        onboarded_at: s.created_at ?? "",
        invoice_id: inv?.id ?? null,
        invoice_amount: amount,
        invoice_paid: paid,
        invoice_balance: Math.max(0, amount - paid),
        fee_structure_name:
          (inv?.fee_structures as { name?: string } | null)?.name ?? null,
        invoice_status: inv?.status ?? null,
        due_date: inv?.due_date ?? null,
      };
    });
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
