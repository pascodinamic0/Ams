"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createStudent } from "@/lib/actions/students";
import { studentImportRowSchema, type StudentImportRow } from "@/lib/validations/academic";

export type StudentImportResult = {
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
  studentIds: string[];
};

export async function importStudentsBatch(
  rows: StudentImportRow[],
  context: { school_id: string; branch_id: string }
): Promise<StudentImportResult | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!context.school_id || !context.branch_id) {
    return { error: "School and branch context are required" };
  }

  const result: StudentImportResult = {
    created: 0,
    failed: 0,
    errors: [],
    studentIds: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2;
    const parsed = studentImportRowSchema.safeParse(rows[i]);

    if (!parsed.success) {
      result.failed++;
      const firstError = parsed.error.issues[0]?.message ?? "Invalid row";
      result.errors.push({ row: rowNumber, message: firstError });
      continue;
    }

    const studentResult = await createStudent({
      ...parsed.data,
      school_id: context.school_id,
      branch_id: context.branch_id,
    });

    if (studentResult.error) {
      result.failed++;
      const message =
        typeof studentResult.error === "string"
          ? studentResult.error
          : Object.values(studentResult.error).flat().join(", ") || "Failed to create student";
      result.errors.push({ row: rowNumber, message });
      continue;
    }

    result.created++;
    if (studentResult.data?.id) {
      result.studentIds.push(studentResult.data.id);
    }
  }

  if (result.created > 0) {
    revalidatePath("/academic/students");
    revalidatePath("/academic");
  }

  return result;
}
