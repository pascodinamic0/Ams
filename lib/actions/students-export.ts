"use server";

import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentsForInscriptionExport } from "@/lib/db/students";
import type { StudentInscriptionExportRow } from "@/lib/db/students";
import { STUDENT_STATUSES } from "@/lib/validations/student";

export async function loadInscriptionExport(
  status?: string
): Promise<StudentInscriptionExportRow[]> {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  const statusFilter =
    status && (STUDENT_STATUSES as readonly string[]).includes(status)
      ? status
      : undefined;

  return getStudentsForInscriptionExport({
    schoolId: profile.school_id ?? undefined,
    branchId: profile.branch_id ?? undefined,
    status: statusFilter,
  });
}
