"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { actionError } from "@/lib/i18n/action-error";
import {
  createNotification,
  createNotifications,
  notifyStudentGuardians,
} from "@/lib/services/notifications";
import {
  sendLessonMaterialSchema,
  type SendLessonMaterialInput,
} from "@/lib/validations/lesson-materials";
import { sanitizeLessonHtml } from "@/lib/rich-text/sanitize";

export async function sendLessonMaterial(input: SendLessonMaterialInput) {
  const parsed = sendLessonMaterialSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: teaches, error: teachesError } = await supabase.rpc(
    "teacher_teaches_class",
    { p_teacher_id: user.id, p_class_id: parsed.data.class_id }
  );

  if (teachesError || !teaches) {
    return await actionError("notAuthorized");
  }

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", parsed.data.class_id)
    .eq("status", "active")
    .in("id", parsed.data.student_ids);

  if (studentsError) return { error: studentsError.message };
  if ((students ?? []).length !== parsed.data.student_ids.length) {
    return await actionError("invalidRecipients");
  }

  const sanitizedNote = parsed.data.note
    ? sanitizeLessonHtml(parsed.data.note) || null
    : null;

  const { data: material, error: materialError } = await supabase
    .from("lesson_materials")
    .insert({
      class_id: parsed.data.class_id,
      subject_id: parsed.data.subject_id || null,
      teacher_id: user.id,
      lesson_date: parsed.data.lesson_date,
      title: parsed.data.title,
      note: sanitizedNote,
    })
    .select("id, title")
    .single();

  if (materialError || !material) {
    return { error: materialError?.message ?? "Failed to create lesson material" };
  }

  if (parsed.data.attachments.length > 0) {
    const attachmentRows = parsed.data.attachments.map((att, index) => {
      if (att.kind === "file") {
        return {
          material_id: material.id,
          kind: "file" as const,
          storage_path: att.storage_path,
          url: null,
          file_name: att.file_name,
          mime_type: att.mime_type ?? null,
          size_bytes: att.size_bytes ?? null,
          sort_order: index,
        };
      }
      return {
        material_id: material.id,
        kind: "link" as const,
        storage_path: null,
        url: att.url,
        file_name: att.file_name?.trim() || att.url,
        mime_type: null,
        size_bytes: null,
        sort_order: index,
      };
    });

    const { error: attachmentError } = await supabase
      .from("lesson_material_attachments")
      .insert(attachmentRows);

    if (attachmentError) {
      await supabase.from("lesson_materials").delete().eq("id", material.id);
      return { error: attachmentError.message };
    }
  }

  const recipientRows = parsed.data.student_ids.map((studentId) => ({
    material_id: material.id,
    student_id: studentId,
  }));

  const { error: recipientError } = await supabase
    .from("lesson_material_recipients")
    .insert(recipientRows);

  if (recipientError) {
    await supabase.from("lesson_materials").delete().eq("id", material.id);
    return { error: recipientError.message };
  }

  const tn = await getTranslations("notifications");
  const title = tn("lessonMaterialSent");
  const body = tn("lessonMaterialSentBody", { title: material.title });

  const { data: recipientStudents } = await supabase
    .from("students")
    .select("id, auth_user_id")
    .in("id", parsed.data.student_ids);

  const studentNotifications = (recipientStudents ?? [])
    .filter((s) => s.auth_user_id)
    .map((s) => ({
      userId: s.auth_user_id as string,
      title,
      body,
      url: "/student/lessons",
    }));

  if (studentNotifications.length > 0) {
    await createNotifications(studentNotifications);
  }

  for (const studentId of parsed.data.student_ids) {
    await notifyStudentGuardians(studentId, {
      title,
      body: tn("lessonMaterialSentGuardianBody", { title: material.title }),
      url: "/parent/lessons",
    });
  }

  revalidatePath("/teacher/attendance");
  revalidatePath("/student/lessons");
  revalidatePath("/parent/lessons");
  revalidatePath("/student");
  revalidatePath("/parent");
  revalidatePath("/notifications");

  return { data: { id: material.id } };
}
