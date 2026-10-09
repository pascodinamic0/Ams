import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeeStructureListItem } from "@/lib/db/fee-structures";
import { createAdminClient } from "@/lib/supabase/admin";

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Year price written on an invoice. Never drop below what was already paid. */
export function pendingEnrollmentInvoiceAmount(catalogAmount: number, amountPaid: number) {
  const paid = roundMoney(amountPaid);
  return Math.max(roundMoney(catalogAmount), paid);
}

/** Full year fee for a facture: the higher of the stored invoice and the fee catalog. */
export function fullYearFee(storedAmount: number, catalogAmount?: number | null) {
  const stored = roundMoney(storedAmount);
  if (catalogAmount == null || Number.isNaN(Number(catalogAmount))) return stored;
  return Math.max(stored, roundMoney(Number(catalogAmount)));
}

/** Facture the family still owes: full year fee minus the exact amount paid. */
export function factureAmount(fullYearAmount: number, amountPaid: number) {
  return Math.max(0, roundMoney(roundMoney(fullYearAmount) - roundMoney(amountPaid)));
}

export function deriveEnrollmentInvoiceStatus(
  amount: number,
  amountPaid: number,
  dueDate: string
) {
  if (amountPaid >= amount) return "paid" as const;
  if (new Date(dueDate) < new Date(new Date().toDateString())) return "overdue" as const;
  return "pending" as const;
}

/** Fee structures applicable to a class (class-specific + school-wide). */
export function filterFeeStructuresForClass(
  structures: FeeStructureListItem[],
  classId: string
): FeeStructureListItem[] {
  return structures.filter(
    (s) => s.class_id === null || s.class_id === classId
  );
}

/** "Frais scolaires — 1ère Primaire" → "Frais scolaires". */
export function feePackageKind(
  name: string,
  className?: string | null
): string {
  const trimmed = name.trim();
  if (className) {
    const suffix = ` — ${className.trim()}`;
    if (trimmed.endsWith(suffix)) {
      return trimmed.slice(0, -suffix.length).trim();
    }
  }
  const splitAt = trimmed.lastIndexOf(" — ");
  if (splitAt > 0) return trimmed.slice(0, splitAt).trim();
  return trimmed;
}

/**
 * Every current-year offer for a class. A class-specific price replaces a
 * school-wide offer of the same name. Highest amount first.
 */
export function feeStructuresForClass(
  structures: FeeStructureListItem[],
  classId: string,
  schoolYear: number
): FeeStructureListItem[] {
  const applicable = filterFeeStructuresForClass(
    structures.filter((structure) => structure.school_year === schoolYear),
    classId
  );
  const classSpecificKinds = new Set(
    applicable
      .filter((structure) => structure.class_id === classId)
      .map((structure) =>
        feePackageKind(structure.name, structure.class_name).toLowerCase()
      )
  );

  return applicable
    .filter((structure) => {
      if (structure.class_id === classId) return true;
      return !classSpecificKinds.has(
        feePackageKind(structure.name, structure.class_name).toLowerCase()
      );
    })
    .sort(
      (a, b) => b.amount - a.amount || a.name.localeCompare(b.name)
    );
}

export async function createEnrollmentInvoiceRpc(
  supabase: SupabaseClient,
  studentId: string,
  feeStructureId: string,
  dueDate?: string
): Promise<{ invoiceId: string } | { error: string }> {
  const { data, error } = await supabase.rpc("create_enrollment_invoice", {
    p_student_id: studentId,
    p_fee_structure_id: feeStructureId,
    p_due_date: dueDate ?? new Date().toISOString().slice(0, 10),
  });

  if (error) {
    console.error("create_enrollment_invoice RPC error:", error);
    return { error: error.message };
  }

  return { invoiceId: data as string };
}

/**
 * A pending student joins the academic roll as soon as any fee payment is
 * recorded. The invoice keeps the remaining balance.
 */
export async function activatePendingStudentWithPayment(
  studentId: string
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { count, error: paidError } = await admin
    .from("fee_invoices")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .gt("amount_paid", 0);

  if (paidError || !count) {
    if (paidError) console.error("activatePendingStudentWithPayment lookup:", paidError);
    return false;
  }

  const { data, error } = await admin
    .from("students")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", studentId)
    .eq("status", "pending")
    .select("id");

  if (error) {
    console.error("activatePendingStudentWithPayment:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}
