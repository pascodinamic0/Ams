"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  admissionSchema,
  onlineEnrollmentSchema,
  type AdmissionFormData,
  type OnlineEnrollmentFormData,
} from "@/lib/validations/academic";
import { revalidateSchoolWebsiteBySchoolId } from "@/lib/schools/revalidate-website";
import { createNotification } from "@/lib/services/notifications";
import { splitPersonName } from "@/lib/utils";
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
  studentName: string
) {
  const supabase = await createClient();
  const { data: guardian } = await supabase
    .from("guardians")
    .select("auth_user_id")
    .eq("school_id", schoolId)
    .eq("email", guardianEmail)
    .maybeSingle();

  if (!guardian?.auth_user_id) return;

  await createNotification({
    userId: guardian.auth_user_id,
    title: "Admission approved",
    body: `${studentName}'s admission application has been approved.`,
  });
}

export async function updateAdmissionStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
) {
  const supabase = await createClient();

  if (status === "approved") {
    const { data: app } = await supabase
      .from("admission_applications")
      .select("school_id, guardian_email, student_name")
      .eq("id", id)
      .single();

    if (app) {
      await notifyAdmissionApproved(app.school_id, app.guardian_email, app.student_name);
    }
  }

  const { error } = await supabase
    .from("admission_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/academic/admissions");
  revalidatePath("/notifications");
  return {};
}

export async function convertAdmissionToStudent(
  admissionId: string,
  branchId: string
) {
  const supabase = await createClient();
  const { data: app, error } = await supabase
    .from("admission_applications")
    .select("*")
    .eq("id", admissionId)
    .single();

  if (error || !app) return { error: "Application not found" };

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
    gender: app.gender ?? undefined,
    class_id: undefined,
    status: "active",
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

  if (studentResult.error || !studentResult.data) {
    return { error: typeof studentResult.error === "string" ? studentResult.error : "Failed to create student" };
  }

  const { error: statusError } = await updateAdmissionStatus(admissionId, "approved");
  if (statusError) return { error: statusError };

  return { data: { studentId: studentResult.data.id } };
}
