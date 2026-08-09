"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  FINANCE_PORTAL_ROLES,
  type UserRole,
} from "@/lib/auth/rbac";
import {
  bulkDemandSchema,
  invoiceSchema,
  type BulkDemandFormData,
  type InvoiceFormData,
} from "@/lib/validations/finance";

function deriveInvoiceStatus(amount: number, amountPaid: number, dueDate: string) {
  if (amountPaid >= amount) return "paid";
  if (new Date(dueDate) < new Date(new Date().toDateString())) return "overdue";
  return "pending";
}

function revalidateInvoicePaths() {
  revalidatePath("/finance/invoices");
  revalidatePath("/finance/invoices/bulk");
  revalidatePath("/finance");
  revalidatePath("/parent/fees");
}

async function requireFinanceActor(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" as const };

  const role = profile.role as UserRole;
  const allowed =
    role === "super_admin" ||
    (FINANCE_PORTAL_ROLES as readonly string[]).includes(role);

  if (!allowed) return { error: "Not authorized" as const };
  if (role !== "super_admin" && !profile.school_id) {
    return { error: "No school linked to your account" as const };
  }

  return { user, profile };
}

export async function createInvoice(input: InvoiceFormData) {
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const auth = await requireFinanceActor(supabase);
  if ("error" in auth) return { error: auth.error };

  let amount = parsed.data.amount;
  const feeStructureId = parsed.data.fee_structure_id || null;

  if (feeStructureId) {
    const { data: structure } = await supabase
      .from("fee_structures")
      .select("amount")
      .eq("id", feeStructureId)
      .single();
    if (structure) amount = Number(structure.amount);
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
  revalidateInvoicePaths();
  return { data: { id: data.id } };
}

/**
 * Create account-level fee demands (one invoice per student account).
 * Skips students that already have an open demand for the same fee structure
 * when skip_existing is true.
 */
export async function createAccountLevelDemands(input: BulkDemandFormData) {
  const parsed = bulkDemandSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const auth = await requireFinanceActor(supabase);
  if ("error" in auth) return { error: auth.error };

  const { student_ids, fee_structure_id, due_date, description, skip_existing } =
    parsed.data;
  const schoolId = auth.profile.school_id;

  const { data: structure, error: structureError } = await supabase
    .from("fee_structures")
    .select("id, amount, name, branch_id, branches(school_id)")
    .eq("id", fee_structure_id)
    .single();

  if (structureError || !structure) {
    return { error: "Fee structure not found" };
  }

  const structureSchoolId = (
    structure.branches as { school_id?: string } | null
  )?.school_id;

  if (
    auth.profile.role !== "super_admin" &&
    schoolId &&
    structureSchoolId &&
    structureSchoolId !== schoolId
  ) {
    return { error: "Fee structure is outside your school" };
  }

  let studentQuery = supabase
    .from("students")
    .select("id, first_name, last_name, student_id, school_id, status")
    .in("id", student_ids);

  if (auth.profile.role !== "super_admin" && schoolId) {
    studentQuery = studentQuery.eq("school_id", schoolId);
  }

  const { data: students, error: studentsError } = await studentQuery;
  if (studentsError) return { error: studentsError.message };

  const foundIds = new Set((students ?? []).map((s) => s.id));
  const missing = student_ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return {
      error: `${missing.length} student account(s) were not found in your school`,
    };
  }

  const amount = Number(structure.amount);
  const status = deriveInvoiceStatus(amount, 0, due_date);
  const demandDescription =
    description?.trim() ||
    `Account-level demand: ${structure.name}`;

  let skipped = 0;
  const toCreate: string[] = [];

  if (skip_existing !== false) {
    const { data: existing } = await supabase
      .from("fee_invoices")
      .select("student_id")
      .eq("fee_structure_id", fee_structure_id)
      .in("student_id", student_ids)
      .in("status", ["pending", "overdue"]);

    const alreadyDemanded = new Set(
      (existing ?? []).map((row) => row.student_id as string)
    );

    for (const id of student_ids) {
      if (alreadyDemanded.has(id)) skipped += 1;
      else toCreate.push(id);
    }
  } else {
    toCreate.push(...student_ids);
  }

  if (toCreate.length === 0) {
    return {
      data: {
        created: 0,
        skipped,
        errors: [] as string[],
        message: "All selected accounts already have an open demand for this fee",
      },
    };
  }

  const rows = toCreate.map((studentId) => ({
    student_id: studentId,
    fee_structure_id,
    amount,
    amount_paid: 0,
    due_date,
    status,
    description: demandDescription,
  }));

  const { data: inserted, error } = await supabase
    .from("fee_invoices")
    .insert(rows)
    .select("id");

  if (error) return { error: error.message };

  revalidateInvoicePaths();
  return {
    data: {
      created: inserted?.length ?? toCreate.length,
      skipped,
      errors: [] as string[],
    },
  };
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
  return {};
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("fee_invoices").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  return {};
}
