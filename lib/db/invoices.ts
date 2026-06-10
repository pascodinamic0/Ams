import { createClient } from "@/lib/supabase/server";

export type InvoiceListItem = {
  id: string;
  student_uuid: string;
  student_id: string;
  student_name: string;
  amount: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  status: string;
  description: string | null;
  fee_structure_name: string | null;
};

export type FinanceKPIs = {
  outstanding: number;
  collected: number;
  overdue: number;
  invoiceCount: number;
};

function isOverdue(status: string, dueDate: string): boolean {
  if (status === "paid") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function mapInvoiceRow(inv: {
  id: string;
  amount: number;
  amount_paid: number | null;
  due_date: string;
  status: string | null;
  description: string | null;
  students: {
    id?: string;
    student_id?: string;
    first_name?: string;
    last_name?: string;
    school_id?: string;
    branch_id?: string;
  } | null;
  fee_structures?: { name?: string } | null;
}): InvoiceListItem & { school_id?: string; branch_id?: string } {
  const s = inv.students;
  const amount = Number(inv.amount);
  const amountPaid = Number(inv.amount_paid ?? 0);
  return {
    id: inv.id,
    student_uuid: s?.id ?? "",
    student_id: s?.student_id ?? "",
    student_name: s ? `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() : "—",
    amount,
    amount_paid: amountPaid,
    balance: Math.max(0, amount - amountPaid),
    due_date: inv.due_date,
    status: inv.status ?? "pending",
    description: inv.description,
    fee_structure_name: inv.fee_structures?.name ?? null,
    school_id: s?.school_id,
    branch_id: s?.branch_id,
  };
}

export async function getInvoices(options?: {
  search?: string;
  status?: string;
  schoolId?: string;
  branchId?: string;
}): Promise<InvoiceListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("fee_invoices")
    .select(`
      id,
      amount,
      amount_paid,
      due_date,
      status,
      description,
      students(
        id,
        student_id,
        first_name,
        last_name,
        school_id,
        branch_id
      ),
      fee_structures(name)
    `)
    .order("due_date", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getInvoices error:", error);
    return [];
  }

  let rows = (data ?? []).map((inv) =>
    mapInvoiceRow(
      inv as Parameters<typeof mapInvoiceRow>[0]
    )
  );

  if (options?.schoolId) {
    rows = rows.filter((r) => r.school_id === options.schoolId);
  }
  if (options?.branchId) {
    rows = rows.filter((r) => r.branch_id === options.branchId);
  }
  if (options?.search) {
    const term = options.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.student_name.toLowerCase().includes(term) ||
        r.student_id.toLowerCase().includes(term)
    );
  }

  return rows.map(({ school_id: _s, branch_id: _b, ...item }) => item);
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fee_invoices")
    .select(`
      *,
      students(id, student_id, first_name, last_name, school_id, branch_id),
      fee_structures(name)
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getInvoicesForGuardian(
  guardianId: string
): Promise<InvoiceListItem[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("guardian_students")
    .select("student_id")
    .eq("guardian_id", guardianId);

  const studentIds = (links ?? []).map((l) => l.student_id);
  if (studentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("fee_invoices")
    .select(`
      id,
      amount,
      amount_paid,
      due_date,
      status,
      description,
      students(
        id,
        student_id,
        first_name,
        last_name,
        school_id,
        branch_id
      ),
      fee_structures(name)
    `)
    .in("student_id", studentIds)
    .order("due_date", { ascending: false });

  if (error) {
    console.error("getInvoicesForGuardian error:", error);
    return [];
  }

  return (data ?? []).map((inv) => {
    const { school_id: _s, branch_id: _b, ...item } = mapInvoiceRow(
      inv as Parameters<typeof mapInvoiceRow>[0]
    );
    return item;
  });
}

export async function getOpenInvoices(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<InvoiceListItem[]> {
  const invoices = await getInvoices(options);
  return invoices.filter((inv) => inv.balance > 0);
}

export async function getFinanceKPIs(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<FinanceKPIs> {
  const invoices = await getInvoices(options);

  let outstanding = 0;
  let collected = 0;
  let overdue = 0;

  for (const inv of invoices) {
    collected += inv.amount_paid;
    const balance = inv.balance;
    if (balance > 0) {
      outstanding += balance;
      if (isOverdue(inv.status, inv.due_date)) {
        overdue += balance;
      }
    }
  }

  return {
    outstanding,
    collected,
    overdue,
    invoiceCount: invoices.length,
  };
}
