"use server";

import { revalidatePath } from "next/cache";
import {
  assertFinanceRole,
  assertRoleAndSchool,
  assertStudentAccess,
} from "@/lib/auth/assert";
import { FINANCE_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import {
  bulkInvoiceSchema,
  invoiceSchema,
  type BulkInvoiceFormData,
  type InvoiceFormData,
} from "@/lib/validations/finance";
import { getStudents } from "@/lib/db/students";

function deriveInvoiceStatus(amount: number, amountPaid: number, dueDate: string) {
  if (amountPaid >= amount) return "paid";
  if (new Date(dueDate) < new Date(new Date().toDateString())) return "overdue";
  return "pending";
}

async function assertInvoiceAccess(invoiceId: string) {
  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("fee_invoices")
    .select("id, student_id, students(school_id)")
    .eq("id", invoiceId)
    .maybeSingle();
  if (!invoice) return { ok: false as const, error: "Invoice not found" };
  const schoolId =
    (invoice.students as { school_id?: string } | null)?.school_id ?? null;
  const access = await assertRoleAndSchool(FINANCE_PORTAL_ROLES, schoolId);
  if (!access.ok) return access;
  return { ok: true as const, profile: access.profile, schoolId: schoolId! };
}

export async function createInvoice(input: InvoiceFormData) {
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const studentAccess = await assertStudentAccess(
    parsed.data.student_id,
    FINANCE_PORTAL_ROLES
  );
  if (!studentAccess.ok) return { error: studentAccess.error };

  const supabase = await createClient();
  let amount = parsed.data.amount;
  const feeStructureId = parsed.data.fee_structure_id || null;

  if (feeStructureId) {
    const { data: structure } = await supabase
      .from("fee_structures")
      .select("amount, branch_id, branches(school_id)")
      .eq("id", feeStructureId)
      .maybeSingle();
    if (!structure) return { error: "Fee structure not found" };
    const structureSchool =
      (structure.branches as { school_id?: string } | null)?.school_id ?? null;
    if (structureSchool !== studentAccess.schoolId) {
      return { error: "Fee structure does not belong to this school" };
    }
    amount = Number(structure.amount);
  }

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
  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  revalidatePath("/parent/fees");
  return { data: { id: data.id } };
}

/** Create invoices for all active students in a class for one fee structure. */
export async function createInvoicesBulk(input: BulkInvoiceFormData) {
  const parsed = bulkInvoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const finance = await assertFinanceRole();
  if (!finance.ok) return { error: finance.error };

  const supabase = await createClient();
  const { data: structure } = await supabase
    .from("fee_structures")
    .select("id, amount, branch_id, class_id, branches(school_id)")
    .eq("id", parsed.data.fee_structure_id)
    .maybeSingle();

  if (!structure) return { error: "Fee structure not found" };

  const schoolId =
    (structure.branches as { school_id?: string } | null)?.school_id ?? null;
  const schoolAccess = await assertRoleAndSchool(FINANCE_PORTAL_ROLES, schoolId);
  if (!schoolAccess.ok) return { error: schoolAccess.error };

  const { data: classRow } = await supabase
    .from("classes")
    .select("id, branch_id, branches(school_id)")
    .eq("id", parsed.data.class_id)
    .maybeSingle();

  if (!classRow) return { error: "Class not found" };
  const classSchool =
    (classRow.branches as { school_id?: string } | null)?.school_id ?? null;
  if (classSchool !== schoolId) {
    return { error: "Class does not belong to this school" };
  }
  if (classRow.branch_id !== structure.branch_id) {
    return { error: "Class and fee structure must be on the same campus" };
  }

  const students = await getStudents({
    classId: parsed.data.class_id,
    schoolId: schoolId!,
    status: "active",
  });

  if (students.length === 0) {
    return { error: "No active students in this class" };
  }

  const studentIds = students.map((s) => s.id);
  const { data: existing } = await supabase
    .from("fee_invoices")
    .select("student_id")
    .eq("fee_structure_id", parsed.data.fee_structure_id)
    .eq("due_date", parsed.data.due_date)
    .in("student_id", studentIds);

  const alreadyBilled = new Set((existing ?? []).map((row) => row.student_id));
  const toCreate = students.filter((s) => !alreadyBilled.has(s.id));

  if (toCreate.length === 0) {
    return {
      error: "All students in this class already have this invoice for that due date",
    };
  }

  const amount = Number(structure.amount);
  const status = deriveInvoiceStatus(amount, 0, parsed.data.due_date);
  const description = parsed.data.description?.trim() || null;

  const { error } = await supabase.from("fee_invoices").insert(
    toCreate.map((student) => ({
      student_id: student.id,
      fee_structure_id: parsed.data.fee_structure_id,
      amount,
      amount_paid: 0,
      due_date: parsed.data.due_date,
      status,
      description,
    }))
  );

  if (error) return { error: error.message };

  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  revalidatePath("/parent/fees");
  return {
    data: {
      created: toCreate.length,
      skipped: alreadyBilled.size,
    },
  };
}

export async function updateInvoice(
  id: string,
  updates: Partial<InvoiceFormData>
) {
  const parsed = invoiceSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertInvoiceAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("fee_invoices")
    .select("amount_paid")
    .eq("id", id)
    .single();

  const amount = parsed.data.amount ?? undefined;
  const dueDate = parsed.data.due_date;
  const amountPaid = Number(existing?.amount_paid ?? 0);

  const payload: Record<string, unknown> = {
    ...parsed.data,
    fee_structure_id:
      parsed.data.fee_structure_id === ""
        ? null
        : parsed.data.fee_structure_id,
    updated_at: new Date().toISOString(),
  };

  if (amount !== undefined && dueDate) {
    payload.status = deriveInvoiceStatus(amount, amountPaid, dueDate);
  } else if (dueDate) {
    const { data: inv } = await supabase
      .from("fee_invoices")
      .select("amount")
      .eq("id", id)
      .single();
    if (inv) {
      payload.status = deriveInvoiceStatus(
        Number(inv.amount),
        amountPaid,
        dueDate
      );
    }
  }

  const { error } = await supabase.from("fee_invoices").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  revalidatePath("/parent/fees");
  return {};
}

export async function deleteInvoice(id: string) {
  const access = await assertInvoiceAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase.from("fee_invoices").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  revalidatePath("/parent/fees");
  return {};
}
