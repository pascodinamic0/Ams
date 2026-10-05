"use server";

import { actionError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  canManageStudentEnrollment,
  canOnboardStudents,
} from "@/lib/auth/rbac";
import { requireAdminClient } from "@/lib/supabase/admin";
import { normalizeStudentTags } from "@/lib/students/tags";
import {
  normalizeGender,
  studentSchema,
  STUDENT_STATUSES,
  type StudentFormData,
  type StudentStatus,
} from "@/lib/validations";
import {
  assertClassCapacity,
  notifyClassMainTeacher,
} from "@/lib/services/class-enrollment";
import { formatPersonName } from "@/lib/utils";
import {
  normalizeInscriptionFields,
  pickNormalizedInscriptionFields,
} from "@/lib/students/inscription";
import { createEnrollmentInvoiceRpc } from "@/lib/services/enrollment-fees";

type StudentActionContext = {
  school_id: string;
  branch_id: string;
  overrideCapacity?: boolean;
};

export async function createStudent(
  input: StudentFormData & StudentActionContext & {
    fee_structure_id: string;
    fee_structure_ids?: string[];
    enrollment_receipt_ref?: string;
  }
) {
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const capacityCheck = await assertClassCapacity({
    classId: parsed.data.class_id,
    override: input.overrideCapacity,
    callerRole: profile?.role,
  });
  if ("error" in capacityCheck) return capacityCheck;

  const inscription = normalizeInscriptionFields(parsed.data);

  const { data, error } = await supabase
    .from("students")
    .insert({
      school_id: input.school_id,
      branch_id: input.branch_id,
      first_name: parsed.data.first_name,
      middle_name: parsed.data.middle_name?.trim() || null,
      last_name: parsed.data.last_name,
      date_of_birth: parsed.data.date_of_birth,
      gender: normalizeGender(parsed.data.gender),
      class_id: parsed.data.class_id,
      status: "pending",
      tags: normalizeStudentTags(parsed.data.tags),
      enrollment_receipt_ref: input.enrollment_receipt_ref?.trim() || null,
      ...inscription,
      photo_url: parsed.data.photo_url?.trim() || null,
    })
    .select("id, student_id, first_name, middle_name, last_name")
    .single();

  if (error) {
    console.error("createStudent error:", error);
    return { error: error.message };
  }

  const feeIds = [
    ...new Set(
      (input.fee_structure_ids?.length
        ? input.fee_structure_ids
        : [input.fee_structure_id]
      ).filter((id) => id.trim())
    ),
  ];
  if (feeIds.length === 0) return await actionError("feeStructureRequired");

  for (const feeId of feeIds) {
    const invoiceResult = await createEnrollmentInvoiceRpc(
      supabase,
      data.id,
      feeId
    );
    if ("error" in invoiceResult) {
      await supabase.from("students").delete().eq("id", data.id);
      return { error: invoiceResult.error };
    }
  }

  revalidatePath("/finance/enrollments");
  revalidatePath("/finance");
  revalidatePath("/academic");
  revalidatePath("/academic/students");
  revalidatePath("/academic/classes");
  revalidatePath("/teacher/classes");
  return { data: { id: data.id, student_id: data.student_id } };
}

export async function updateStudent(
  id: string,
  updates: Partial<StudentFormData> & { overrideCapacity?: boolean }
) {
  const { overrideCapacity, ...studentUpdates } = updates;
  const parsed = studentSchema.partial().safeParse(studentUpdates);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const touchesEnrollmentMeta =
    parsed.data.status !== undefined || parsed.data.tags !== undefined;
  if (touchesEnrollmentMeta && !canManageStudentEnrollment(profile?.role)) {
    return await actionError("noPermissionUpdateEnrollment");
  }

  const { data: existing } = await supabase
    .from("students")
    .select("id, class_id, first_name, middle_name, last_name")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return await actionError("studentNotFound");

  if (
    parsed.data.class_id !== undefined &&
    parsed.data.class_id !== existing.class_id
  ) {
    const capacityCheck = await assertClassCapacity({
      classId: parsed.data.class_id,
      excludeStudentId: id,
      override: overrideCapacity,
      callerRole: profile?.role,
    });
    if ("error" in capacityCheck) return capacityCheck;
  }

  const inscriptionPatch = pickNormalizedInscriptionFields(parsed.data);
  const hasInscriptionKeys = Object.keys(inscriptionPatch).length > 0;

  const { data: updated, error } = await supabase
    .from("students")
    .update({
      ...parsed.data,
      ...(parsed.data.gender !== undefined
        ? { gender: normalizeGender(parsed.data.gender) }
        : {}),
      ...(parsed.data.middle_name !== undefined
        ? { middle_name: parsed.data.middle_name.trim() || null }
        : {}),
      ...(parsed.data.photo_url !== undefined
        ? { photo_url: parsed.data.photo_url.trim() || null }
        : {}),
      ...(parsed.data.tags !== undefined
        ? { tags: normalizeStudentTags(parsed.data.tags) }
        : {}),
      ...(hasInscriptionKeys ? inscriptionPatch : {}),
    })
    .eq("id", id)
    .select("id, class_id, first_name, middle_name, last_name")
    .single();

  if (error) {
    console.error("updateStudent error:", error);
    return { error: error.message };
  }

  if (
    parsed.data.class_id !== undefined &&
    parsed.data.class_id !== existing.class_id &&
    updated?.class_id
  ) {
    await notifyClassMainTeacher({
      classId: updated.class_id,
      studentId: updated.id,
      studentName: formatPersonName(updated),
    });
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  revalidatePath(`/academic/students/${id}`);
  revalidatePath("/academic/classes");
  revalidatePath("/teacher/classes");
  return {} as { error?: string };
}

const enrollmentMetaSchema = z.object({
  status: z.enum(STUDENT_STATUSES),
  tags: z.array(z.string()).default([]),
});

/** Update enrollment status + follow-up tags (academic/super admin). */
export async function updateStudentEnrollmentMeta(
  id: string,
  input: { status: StudentStatus; tags: string[] }
) {
  const parsed = enrollmentMetaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  return updateStudent(id, {
    status: parsed.data.status,
    tags: normalizeStudentTags(parsed.data.tags),
  });
}

export async function assignStudentClass(
  studentId: string,
  classId: string,
  options?: { overrideCapacity?: boolean }
) {
  return updateStudent(studentId, {
    class_id: classId,
    overrideCapacity: options?.overrideCapacity,
  });
}

/** Change the unpaid enrollment invoice package while the student is still pending. */
export async function updateEnrollmentFee(
  studentId: string,
  feeStructureId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (!canOnboardStudents(profile?.role)) {
    return await actionError("noPermissionOnboardStudents");
  }

  if (!z.string().uuid().safeParse(feeStructureId).success) {
    return await actionError("feeStructureRequired");
  }

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const admin = adminResult.client;

  const { data: student } = await admin
    .from("students")
    .select("id, school_id, branch_id, class_id, status")
    .eq("id", studentId)
    .maybeSingle();

  if (!student) return await actionError("studentNotFound");
  if (profile?.school_id && profile.school_id !== student.school_id) {
    return await actionError("noPermissionOnboardStudents");
  }
  if (student.status !== "pending") {
    return await actionError("studentNotPending");
  }
  if (!student.class_id) return await actionError("classRequired");

  const { data: structure } = await admin
    .from("fee_structures")
    .select("id, name, amount, description, class_id, branch_id")
    .eq("id", feeStructureId)
    .maybeSingle();

  if (!structure || structure.branch_id !== student.branch_id) {
    return await actionError("feeStructureNotFound");
  }
  if (structure.class_id && structure.class_id !== student.class_id) {
    return await actionError("feeStructureNotFound");
  }

  const { data: invoices } = await admin
    .from("fee_invoices")
    .select("id, amount_paid, source")
    .eq("student_id", studentId)
    .eq("source", "enrollment");

  const rows = invoices ?? [];
  const open = rows.filter((invoice) => Number(invoice.amount_paid ?? 0) === 0);
  if (rows.some((invoice) => Number(invoice.amount_paid ?? 0) > 0) || open.length !== 1) {
    if (rows.some((invoice) => Number(invoice.amount_paid ?? 0) > 0)) {
      return await actionError("enrollmentFeeAlreadyPaid");
    }
    return await actionError("enrollmentFeeNotFound");
  }

  const invoice = open[0];
  const { count } = await admin
    .from("fee_payments")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", invoice.id);
  if ((count ?? 0) > 0) return await actionError("enrollmentFeeAlreadyPaid");

  const { error } = await admin
    .from("fee_invoices")
    .update({
      fee_structure_id: structure.id,
      amount: structure.amount,
      description: structure.description?.trim() || structure.name,
    })
    .eq("id", invoice.id)
    .eq("student_id", studentId);

  if (error) {
    console.error("updateEnrollmentFee error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  revalidatePath(`/academic/students/${studentId}`);
  revalidatePath("/finance");
  revalidatePath("/finance/enrollments");
  revalidatePath("/finance/invoices");
  return {} as { error?: string };
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    (profile.role !== "academic_admin" && profile.role !== "super_admin")
  ) {
    return await actionError("onlyAcademicAdminsDeleteStudents");
  }

  let studentQuery = supabase
    .from("students")
    .select("id, school_id, first_name, middle_name, last_name")
    .eq("id", id);
  if (profile.role === "academic_admin") {
    if (!profile.school_id) return await actionError("noSchoolLinkedShort");
    studentQuery = studentQuery.eq("school_id", profile.school_id);
  }

  const { data: student } = await studentQuery.maybeSingle();
  if (!student) return await actionError("studentNotFound");

  const studentName = formatPersonName(student);
  const { error: linkedAdmissionError } = await supabase
    .from("admission_applications")
    .delete()
    .eq("student_id", student.id);
  if (linkedAdmissionError) {
    console.error("deleteStudent linked admission error:", linkedAdmissionError);
  }

  if (studentName) {
    const { error: namedAdmissionError } = await supabase
      .from("admission_applications")
      .delete()
      .eq("school_id", student.school_id)
      .eq("status", "approved")
      .eq("student_name", studentName)
      .is("student_id", null);
    if (namedAdmissionError) {
      console.error("deleteStudent named admission error:", namedAdmissionError);
    }
  }

  let query = supabase.from("students").delete().eq("id", id);
  if (profile.role === "academic_admin") {
    query = query.eq("school_id", profile.school_id);
  }

  const { data, error } = await query.select("id").maybeSingle();

  if (error) {
    console.error("deleteStudent error:", error);
    return { error: error.message };
  }
  if (!data) return await actionError("studentNotFound");

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  revalidatePath("/academic/admissions");
  return {} as { error?: string };
}
