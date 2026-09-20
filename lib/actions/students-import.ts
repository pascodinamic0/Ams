"use server";

import { actionError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canOnboardStudents } from "@/lib/auth/rbac";
import { createStudent } from "@/lib/actions/students";
import { studentImportRowSchema, type StudentImportRow } from "@/lib/validations/academic";
import { getTranslations } from "next-intl/server";
import { getFeeStructures } from "@/lib/db/fee-structures";
import { resolveImportFeeStructureId } from "@/lib/services/enrollment-fees";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (!canOnboardStudents(profile?.role)) {
    return await actionError("noPermissionOnboardStudents");
  }

  if (!context.school_id || !context.branch_id) {
    return await actionError("schoolAndBranchRequired");
  }

  if (profile?.school_id && profile.school_id !== context.school_id) {
    return await actionError("noPermissionOnboardStudents");
  }

  const feeStructures = await getFeeStructures({
    branchId: context.branch_id,
    schoolId: context.school_id,
  });

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

    const feeResolved = resolveImportFeeStructureId(
      feeStructures,
      parsed.data.class_id,
      parsed.data.fee_structure_id ?? parsed.data.fee_structure
    );
    if ("error" in feeResolved) {
      result.failed++;
      const key = feeResolved.error;
      const message = te.has(key) ? te(key) : key;
      result.errors.push({ row: rowNumber, message });
      continue;
    }

    const studentResult = await createStudent({
      first_name: parsed.data.first_name,
      middle_name: parsed.data.middle_name,
      last_name: parsed.data.last_name,
      gender: parsed.data.gender,
      place_of_birth: parsed.data.place_of_birth,
      date_of_birth: parsed.data.date_of_birth,
      previous_school: parsed.data.previous_school,
      father_name: parsed.data.parent_name,
      contact_phone: parsed.data.parent_phone,
      home_address: parsed.data.address,
      responsible_profession: parsed.data.parent_profession,
      class_id: parsed.data.class_id,
      status: "pending",
      tags: [],
      school_id: context.school_id,
      branch_id: context.branch_id,
      fee_structure_id: feeResolved.id,
      enrollment_receipt_ref: parsed.data.enrollment_receipt_ref,
      overrideCapacity: context.overrideCapacity,
    });

    if (studentResult.error) {
      result.failed++;
      const message =
        typeof studentResult.error === "string"
          ? studentResult.error
          : Object.values(studentResult.error).flat().join(", ") ||
            te("failedCreateStudent");
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
    revalidatePath("/finance/enrollments");
    revalidatePath("/finance");
  }

  return result;
}
