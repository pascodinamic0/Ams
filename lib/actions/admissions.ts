"use server";

import { actionError } from "@/lib/i18n/action-error";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  admissionSchema,
  onlineEnrollmentSchema,
  type AdmissionFormData,
  type OnlineEnrollmentFormData,
} from "@/lib/validations/academic";
import { revalidateSchoolWebsiteBySchoolId } from "@/lib/schools/revalidate-website";
import { getTranslations } from "next-intl/server";
import { createNotification } from "@/lib/services/notifications";
import { sendAdmissionApprovedEmail } from "@/lib/services/email";
import { splitPersonName } from "@/lib/utils";
import { normalizeGender } from "@/lib/validations/student";
import { createStudentWithGuardians } from "./student-onboarding";

export async function createAdmission(
  schoolId: string,
  input: AdmissionFormData & { source?: "online" | "manual" }
) {
  const parsed = admissionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admission_applications")
    .insert({
      school_id: schoolId,
      ...parsed.data,
      gender: normalizeGender(parsed.data.gender),
      class_id: parsed.data.class_id ?? null,
      source: input.source ?? "manual",
      status: "pending",
      requires_campus_visit: input.source === "online",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/academic/admissions");
  if (input.source === "online") {
    revalidatePath("/schools");
    await revalidateSchoolWebsiteBySchoolId(schoolId);
  }
  return { data: { id: data.id } };
}

export async function submitOnlineEnrollment(schoolId: string, input: OnlineEnrollmentFormData) {
  const parsed = onlineEnrollmentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  return createAdmission(schoolId, {
    ...parsed.data,
    source: "online",
  });
}

async function notifyAdmissionApproved(
  schoolId: string,
  guardianEmail: string,
  studentName: string,
  applicationId: string
) {
  const supabase = await createClient();
  const [{ data: guardian }, { data: school }] = await Promise.all([
    supabase
      .from("guardians")
      .select("auth_user_id")
      .eq("school_id", schoolId)
      .eq("email", guardianEmail)
      .maybeSingle(),
    supabase.from("schools").select("name, locale").eq("id", schoolId).maybeSingle(),
  ]);

  if (guardianEmail) {
    const emailResult = await sendAdmissionApprovedEmail({
      to: guardianEmail,
      studentName,
      schoolName: school?.name,
      applicationId,
      locale: school?.locale,
    });
    if (!emailResult.success) {
      console.error("Admission approved email failed:", emailResult.error);
    }
  }

  if (!guardian?.auth_user_id) return;

  const tn = await getTranslations("notifications");
  await createNotification({
    userId: guardian.auth_user_id,
    title: tn("admissionApproved"),
    body: tn("admissionApprovedBody", { studentName }),
  });
}

export async function updateAdmissionStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
  options?: { studentId?: string }
) {
  const supabase = await createClient();

  if (status === "approved") {
    const { data: app } = await supabase
      .from("admission_applications")
      .select("id, school_id, guardian_email, student_name")
      .eq("id", id)
      .single();

    if (app) {
      await notifyAdmissionApproved(
        app.school_id,
        app.guardian_email,
        app.student_name,
        app.id
      );
    }
  }

  const { error } = await supabase
    .from("admission_applications")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(options?.studentId ? { student_id: options.studentId } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/academic/admissions");
  revalidatePath("/notifications");
  return {} as { error?: string };
}

export async function convertAdmissionToStudent(
  admissionId: string,
  branchId: string,
  classId: string,
  options?: { overrideCapacity?: boolean }
) {
  if (!classId) return await actionError("classRequired");

  const supabase = await createClient();
  const { data: app, error } = await supabase
    .from("admission_applications")
    .select("*")
    .eq("id", admissionId)
    .single();

  if (error || !app) return await actionError("applicationNotFound");

  const studentName = splitPersonName(app.student_name);
  const guardianName = splitPersonName(app.guardian_name);

  const pickupPersons: Array<{
    full_name: string;
    phone: string;
    relationship: string;
    notes?: string;
  }> = Array.isArray(app.pickup_persons)
    ? (app.pickup_persons as unknown[])
        .filter(
          (p): p is {
            full_name?: string;
            phone?: string;
            relationship?: string;
            notes?: string;
          } => typeof p === "object" && p !== null
        )
        .map((p) => ({
          full_name: String(p.full_name ?? "").trim(),
          phone: String(p.phone ?? "").trim(),
          relationship: String(p.relationship ?? "").trim(),
          notes: p.notes ? String(p.notes) : undefined,
        }))
        .filter((p) => p.full_name && p.phone && p.relationship)
    : [];

  // Legacy applications (pre-pickup fields) default the guardian as authorized.
  const guardianCanPickup =
    Boolean(app.guardian_can_pickup) || pickupPersons.length === 0;

  const studentResult = await createStudentWithGuardians({
    school_id: app.school_id,
    branch_id: branchId,
    first_name: studentName.first_name,
    middle_name: studentName.middle_name,
    last_name: studentName.last_name,
    date_of_birth: app.dob ?? "2000-01-01",
    gender: normalizeGender(app.gender) ?? undefined,
    class_id: classId,
    status: "active",
    tags: [],
    overrideCapacity: options?.overrideCapacity,
    existing_guardian_can_pickup: false,
    add_secondary_guardian: false,
    primary_guardian: {
      first_name: guardianName.first_name,
      middle_name: guardianName.middle_name,
      last_name: guardianName.last_name,
      email: app.guardian_email,
      whatsapp: app.guardian_phone ?? undefined,
      relation: app.relation ?? "guardian",
      can_pickup: guardianCanPickup,
    },
    pickup_persons: pickupPersons,
  });

  if ("error" in studentResult && studentResult.error) {
    return {
      error:
        typeof studentResult.error === "string"
          ? studentResult.error
          : (await actionError("failedCreateStudent")).error,
    };
  }
  if (!("data" in studentResult) || !studentResult.data) {
    return await actionError("failedCreateStudent");
  }

  const { error: statusError } = await updateAdmissionStatus(admissionId, "approved", {
    studentId: studentResult.data.id,
  });
  if (statusError) return { error: statusError };

  return { data: { studentId: studentResult.data.id } };
}
