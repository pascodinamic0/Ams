"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations/finance";
import { getStudentsForBilling } from "@/lib/db/students";

function deriveInvoiceStatus(amount: number, amountPaid: number, dueDate: string) {
  if (amountPaid >= amount) return "paid";
  if (new Date(dueDate) < new Date(new Date().toDateString())) return "overdue";
  return "pending";
}

function revalidateInvoicePaths() {
  revalidatePath("/finance/invoices");
  revalidatePath("/finance/outstanding");
  revalidatePath("/finance");
  revalidatePath("/finance/payments");
  revalidatePath("/parent/fees");
}

async function resolveInvoiceAmount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  amount: number,
  feeStructureId: string | null
) {
  if (!feeStructureId) return amount;
  const { data: structure } = await supabase
    .from("fee_structures")
    .select("amount")
    .eq("id", feeStructureId)
    .single();
  return structure ? Number(structure.amount) : amount;
}

export async function createInvoice(input: InvoiceFormData) {
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const feeStructureId = parsed.data.fee_structure_id || null;
  const amount = await resolveInvoiceAmount(
    supabase,
    parsed.data.amount,
    feeStructureId
  );
  const status = deriveInvoiceStatus(amount, 0, parsed.data.due_date);

  const { data, error } = await supabase
    .from("fee_invoices")
    .insert({
      student_id: parsed.data.student_id,
      fee_structure_id: feeStructureId,
      amount,
      amount_paid: 0,
      due_date: parsed.data.due_date,
      status,
      description: parsed.data.description || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidateInvoicePaths();
  return { data: { id: data.id } };
}

export async function updateInvoice(
  id: string,
  updates: Partial<InvoiceFormData>
) {
  const parsed = invoiceSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("fee_invoices")
    .select("amount_paid, amount, due_date, fee_structure_id")
    .eq("id", id)
    .single();

  if (!existing) return await actionError("invoiceNotFound");

  const feeStructureId =
    parsed.data.fee_structure_id === undefined
      ? existing.fee_structure_id
      : parsed.data.fee_structure_id === ""
        ? null
        : parsed.data.fee_structure_id;

  const amount =
    parsed.data.amount !== undefined
      ? await resolveInvoiceAmount(supabase, parsed.data.amount, feeStructureId)
      : await resolveInvoiceAmount(
          supabase,
          Number(existing.amount),
          feeStructureId
        );

  const dueDate = parsed.data.due_date ?? existing.due_date;
  const amountPaid = Number(existing.amount_paid ?? 0);

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    amount,
    due_date: dueDate,
    fee_structure_id: feeStructureId,
    status: deriveInvoiceStatus(amount, amountPaid, dueDate),
  };

  if (parsed.data.student_id !== undefined) {
    payload.student_id = parsed.data.student_id;
  }
  if (parsed.data.description !== undefined) {
    payload.description = parsed.data.description || null;
  }

  const { error } = await supabase.from("fee_invoices").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidateInvoicePaths();
  return {};
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("fee_invoices").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateInvoicePaths();
  return {};
}

/** Create invoices for all active students (optionally class-filtered via fee structure). */
export async function generateInvoicesFromFeeStructure(input: {
  fee_structure_id: string;
  due_date: string;
  description?: string;
}) {
  const feeStructureId = input.fee_structure_id;
  const dueDate = input.due_date;
  if (!feeStructureId || !dueDate) {
    return await actionError("feeStructureDueRequired");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? undefined;

  const { data: structure, error: structureError } = await supabase
    .from("fee_structures")
    .select("id, amount, class_id, name, description")
    .eq("id", feeStructureId)
    .single();

  if (structureError || !structure) {
    return structureError?.message
      ? { error: structureError.message }
      : await actionError("feeStructureNotFound");
  }

  const students = await getStudentsForBilling({
    schoolId,
    classId: structure.class_id ?? undefined,
    status: "active",
  });

  if (students.length === 0) {
    return await actionError("noActiveStudentsInvoice");
  }

  const amount = Number(structure.amount);
  const status = deriveInvoiceStatus(amount, 0, dueDate);
  const description =
    input.description?.trim() ||
    structure.description ||
    structure.name ||
    null;

  const rows = students.map((student) => ({
    student_id: student.id,
    fee_structure_id: feeStructureId,
    amount,
    amount_paid: 0,
    due_date: dueDate,
    status,
    description,
  }));

  const { data, error } = await supabase
    .from("fee_invoices")
    .insert(rows)
    .select("id");

  if (error) return { error: error.message };
  revalidateInvoicePaths();
  return { data: { created: data?.length ?? rows.length } };
}
