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
