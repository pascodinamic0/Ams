import type { SupabaseClient } from "@supabase/supabase-js";

/** Activated students, and pending students who already have a recorded payment. */
export function isRecognizedStudent(
  status: string | null | undefined,
  hasPaid: boolean
) {
  if (status === "active") return true;
  return status === "pending" && hasPaid;
}

export async function paidStudentIdSet(
  supabase: SupabaseClient,
  studentIds: string[]
): Promise<Set<string>> {
  const paid = new Set<string>();
  const ids = [...new Set(studentIds)];
  for (let offset = 0; offset < ids.length; offset += 150) {
    const slice = ids.slice(offset, offset + 150);
    if (slice.length === 0) continue;
    const { data, error } = await supabase
      .from("fee_invoices")
      .select("student_id, amount_paid")
      .in("student_id", slice)
      .gt("amount_paid", 0);
    if (error) {
      console.error("paidStudentIdSet error:", error);
      continue;
    }
    for (const row of data ?? []) {
      if (Number(row.amount_paid ?? 0) > 0) paid.add(row.student_id as string);
    }
  }
  return paid;
}

export async function keepRecognizedStudents<
  T extends { id: string; status?: string | null },
>(supabase: SupabaseClient, students: T[]): Promise<T[]> {
  const pendingIds = students
    .filter((student) => student.status === "pending")
    .map((student) => student.id);
  const paid =
    pendingIds.length > 0
      ? await paidStudentIdSet(supabase, pendingIds)
      : new Set<string>();
  return students.filter((student) =>
    isRecognizedStudent(student.status, paid.has(student.id))
  );
}
