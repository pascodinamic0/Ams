"use server";

import { getTranslations } from "next-intl/server";
import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification, notifyStudentGuardians } from "@/lib/services/notifications";
import { assignmentSchema, type AssignmentFormData } from "@/lib/validations/teacher";
import { z } from "zod";

const gradeSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  grade: z.number().min(0).max(100),
});

export async function createAssignment(input: AssignmentFormData) {
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      class_id: parsed.data.class_id,
      teacher_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_date: parsed.data.due_date || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/teacher/assignments");
  return { data: { id: data.id } };
}

export async function updateAssignment(id: string, updates: Partial<AssignmentFormData>) {
  const parsed = assignmentSchema.partial().safeParse(updates);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { error } = await supabase
    .from("assignments")
    .update({
      ...parsed.data,
      due_date: parsed.data.due_date === undefined ? undefined : parsed.data.due_date || null,
    })
    .eq("id", id)
    .eq("teacher_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/teacher/assignments");
  return {};
}

export async function deleteAssignment(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id)
    .eq("teacher_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/teacher/assignments");
  return {};
}

export async function gradeSubmission(input: { submissionId: string; grade: number }) {
  const parsed = gradeSubmissionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: submission, error: fetchError } = await supabase
    .from("assignment_submissions")
    .select(`
      id,
      student_id,
      assignments(id, title, teacher_id)
    `)
    .eq("id", parsed.data.submissionId)
    .single();

  if (fetchError || !submission) return await actionError("submissionNotFound");

  const assignmentRaw = submission.assignments as
    | { id: string; title: string; teacher_id: string }
    | { id: string; title: string; teacher_id: string }[]
    | null;
  const assignment = Array.isArray(assignmentRaw) ? assignmentRaw[0] : assignmentRaw;

  if (!assignment || assignment.teacher_id !== user.id) {
    return await actionError("notAuthorizedGradeSubmission");
  }

  const { error } = await supabase
    .from("assignment_submissions")
    .update({ grade: parsed.data.grade })
    .eq("id", parsed.data.submissionId);

  if (error) return { error: error.message };

  const tn = await getTranslations("notifications");
  const gradeText = `${parsed.data.grade}%`;
  const title = tn("assignmentGraded");
  const body = tn("assignmentGradedBody", {
    title: assignment.title,
    grade: gradeText,
  });

  const { data: student } = await supabase
    .from("students")
    .select("auth_user_id")
    .eq("id", submission.student_id)
    .maybeSingle();

  if (student?.auth_user_id) {
    await createNotification({ userId: student.auth_user_id, title, body });
  }

  await notifyStudentGuardians(submission.student_id, {
    title,
    body: tn("assignmentGradedGuardianBody", {
      grade: gradeText,
      title: assignment.title,
    }),
  });

  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
  revalidatePath("/parent/assignments");
  revalidatePath("/notifications");
  return {};
}
