"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { admissionSchema, type AdmissionFormData } from "@/lib/validations/academic";
import { createNotification } from "@/lib/services/notifications";
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
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/academic/admissions");
  if (input.source === "online") {
    revalidatePath("/schools");
  }
  return { data: { id: data.id } };
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

  const nameParts = app.student_name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? app.student_name;
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const studentResult = await createStudentWithGuardians({
    school_id: app.school_id,
    branch_id: branchId,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: app.dob ?? "2000-01-01",
    gender: app.gender ?? undefined,
    class_id: undefined,
    status: "active",
    add_secondary_guardian: false,
    primary_guardian: {
      name: app.guardian_name,
      email: app.guardian_email,
      whatsapp: app.guardian_phone ?? undefined,
      relation: app.relation ?? "guardian",
    },
  });

  if (studentResult.error || !studentResult.data) {
    return { error: typeof studentResult.error === "string" ? studentResult.error : "Failed to create student" };
  }

  const { error: statusError } = await updateAdmissionStatus(admissionId, "approved");
  if (statusError) return { error: statusError };

  return { data: { studentId: studentResult.data.id } };
}
