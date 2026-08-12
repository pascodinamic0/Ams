import { createClient } from "@/lib/supabase/server";
import { formatPersonName } from "@/lib/utils";

export type InvoiceListItem = {
  id: string;
  student_uuid: string;
  student_id: string;
  student_name: string;
  class_name: string | null;
  amount: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  status: string;
  description: string | null;
  fee_structure_id: string | null;
  fee_structure_name: string | null;
};

export type OutstandingStudentGroup = {
  student_uuid: string;
  student_id: string;
  student_name: string;
  class_name: string | null;
  total_balance: number;
  invoices: InvoiceListItem[];
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
  fee_structure_id?: string | null;
  students: {
    id?: string;
    student_id?: string;
    first_name?: string;
    middle_name?: string | null;
    last_name?: string;
    school_id?: string;
    branch_id?: string;
    classes?: { name?: string } | null;
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
    student_name: s ? formatPersonName(s) : "—",
    class_name: s?.classes?.name ?? null,
    amount,
    amount_paid: amountPaid,
    balance: Math.max(0, amount - amountPaid),
    due_date: inv.due_date,
    status: inv.status ?? "pending",
    description: inv.description,
    fee_structure_id: inv.fee_structure_id ?? null,
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
      fee_structure_id,
      students(
        id,
        student_id,
        first_name,
        middle_name,
        last_name,
        school_id,
        branch_id,
        classes(name)
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
      students(id, student_id, first_name, middle_name, last_name, school_id, branch_id, classes(name)),
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
      fee_structure_id,
      students(
        id,
        student_id,
        first_name,
        middle_name,
        last_name,
        school_id,
        branch_id,
        classes(name)
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

export async function getInvoicesForStudent(
  studentId: string
): Promise<InvoiceListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fee_invoices")
    .select(`
      id,
      amount,
      amount_paid,
      due_date,
      status,
      description,
      fee_structure_id,
      students(
        id,
        student_id,
        first_name,
        middle_name,
        last_name,
        school_id,
        branch_id,
        classes(name)
      ),
      fee_structures(name)
    `)
    .eq("student_id", studentId)
    .order("due_date", { ascending: false });

  if (error) {
    console.error("getInvoicesForStudent error:", error);
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
  search?: string;
  className?: string;
  overdueOnly?: boolean;
}): Promise<InvoiceListItem[]> {
  const invoices = await getInvoices({
    schoolId: options?.schoolId,
    branchId: options?.branchId,
    search: options?.search,
  });

  const today = new Date(new Date().toDateString());

  return invoices.filter((inv) => {
    if (inv.balance <= 0) return false;
    if (options?.className && inv.class_name !== options.className) return false;
    if (options?.overdueOnly) {
      const overdue =
        inv.status === "overdue" ||
        (inv.status === "pending" && new Date(inv.due_date) < today);
      if (!overdue) return false;
    }
    return true;
  });
}

export function groupOutstandingByStudent(
  invoices: InvoiceListItem[]
): OutstandingStudentGroup[] {
  const map = new Map<string, OutstandingStudentGroup>();

  for (const inv of invoices) {
    const key = inv.student_uuid || inv.student_id || inv.id;
    const existing = map.get(key);
    if (existing) {
      existing.invoices.push(inv);
      existing.total_balance += inv.balance;
      continue;
    }
    map.set(key, {
      student_uuid: inv.student_uuid,
      student_id: inv.student_id,
      student_name: inv.student_name,
      class_name: inv.class_name,
      total_balance: inv.balance,
      invoices: [inv],
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    a.student_name.localeCompare(b.student_name)
  );
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
