import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeeStructureListItem } from "@/lib/db/fee-structures";

/** Fee structures applicable to a class (class-specific + school-wide). */
export function filterFeeStructuresForClass(
  structures: FeeStructureListItem[],
  classId: string
): FeeStructureListItem[] {
  return structures.filter(
    (s) => s.class_id === null || s.class_id === classId
  );
}

/** Resolve import row fee structure by UUID, name, or sole class match. */
export function resolveImportFeeStructureId(
  structures: FeeStructureListItem[],
  classId: string,
  input?: string | null
): { id: string } | { error: string } {
  const applicable = filterFeeStructuresForClass(structures, classId);

  const trimmed = input?.trim();
  if (trimmed) {
    const byId = applicable.find((s) => s.id === trimmed);
    if (byId) return { id: byId.id };

    const lower = trimmed.toLowerCase();
    const byName = applicable.filter((s) => s.name.toLowerCase() === lower);
    if (byName.length === 1) return { id: byName[0].id };
    if (byName.length > 1) {
      return { error: "feeStructureAmbiguous" };
    }
    return { error: "feeStructureNotFound" };
  }

  if (applicable.length === 1) return { id: applicable[0].id };
  if (applicable.length === 0) return { error: "feeStructureRequiredForClass" };
  return { error: "feeStructureAmbiguous" };
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
