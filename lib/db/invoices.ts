import { createClient } from "@/lib/supabase/server";

export type InvoiceListItem = {
  id: string;
  student_id: string;
  student_name: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  status: string;
};

export async function getInvoices(options?: {
  search?: string;
  status?: string;
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
      students(
        id,
        student_id,
        first_name,
        last_name
      )
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

  return (data ?? []).map((inv) => {
    const s = inv.students as {
      student_id?: string;
      first_name?: string;
      last_name?: string;
    } | null;
    return {
      id: inv.id,
      student_id: s?.student_id ?? "",
      student_name: s ? `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() : "—",
      amount: Number(inv.amount),
      amount_paid: Number(inv.amount_paid ?? 0),
      due_date: inv.due_date,
      status: inv.status ?? "pending",
    };
  });
}
