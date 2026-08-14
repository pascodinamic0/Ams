"use server";

import { actionError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createStudent } from "@/lib/actions/students";
import { studentImportRowSchema, type StudentImportRow } from "@/lib/validations/academic";
import { getTranslations } from "next-intl/server";

export type StudentImportResult = {
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
  studentIds: string[];
};

export async function importStudentsBatch(
  rows: StudentImportRow[],
  context: { school_id: string; branch_id: string; overrideCapacity?: boolean }
): Promise<StudentImportResult | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  if (!context.school_id || !context.branch_id) {
    return await actionError("schoolAndBranchRequired");
  }

  const result: StudentImportResult = {
    created: 0,
    failed: 0,
    errors: [],
    studentIds: [],
  };

  const tv = await getTranslations("validation");
  const te = await getTranslations("errors");

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2;
    const parsed = studentImportRowSchema.safeParse(rows[i]);

    if (!parsed.success) {
      result.failed++;
      const key = parsed.error.issues[0]?.message ?? "invalidRow";
      const firstError = tv.has(key) ? tv(key) : tv("invalidRow");
      result.errors.push({ row: rowNumber, message: firstError });
      continue;
    }

    const studentResult = await createStudent({
      ...parsed.data,
      school_id: context.school_id,
      branch_id: context.branch_id,
      overrideCapacity: context.overrideCapacity,
    });

    if (studentResult.error) {
      result.failed++;
      const message =
        typeof studentResult.error === "string"
          ? studentResult.error
          : Object.values(studentResult.error).flat().join(", ") || te("failedCreateStudent");
      result.errors.push({ row: rowNumber, message });
      continue;
    }

    result.created++;
    if ("data" in studentResult && studentResult.data?.id) {
      result.studentIds.push(studentResult.data.id);
    }
  }

  if (result.created > 0) {
    revalidatePath("/academic/students");
    revalidatePath("/academic");
  }

  return result;
}
