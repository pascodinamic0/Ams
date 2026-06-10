"use server";

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
  if (!user) return { error: "Not authenticated" };

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
  if (!user) return { error: "Not authenticated" };

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
  if (!user) return { error: "Not authenticated" };

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
  if (!user) return { error: "Not authenticated" };

  const { data: submission, error: fetchError } = await supabase
    .from("assignment_submissions")
    .select(`
      id,
      student_id,
      assignments(id, title, teacher_id)
    `)
    .eq("id", parsed.data.submissionId)
    .single();

  if (fetchError || !submission) return { error: "Submission not found" };

  const assignmentRaw = submission.assignments as
    | { id: string; title: string; teacher_id: string }
    | { id: string; title: string; teacher_id: string }[]
    | null;
  const assignment = Array.isArray(assignmentRaw) ? assignmentRaw[0] : assignmentRaw;

  if (!assignment || assignment.teacher_id !== user.id) {
    return { error: "Not authorized to grade this submission" };
  }

  const { error } = await supabase
    .from("assignment_submissions")
    .update({ grade: parsed.data.grade })
    .eq("id", parsed.data.submissionId);

  if (error) return { error: error.message };

  const gradeText = `${parsed.data.grade}%`;
  const title = "Assignment graded";
  const body = `Your submission for "${assignment.title}" was graded: ${gradeText}.`;

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
    body: `An assignment submission was graded: ${gradeText} for "${assignment.title}".`,
  });

  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
  revalidatePath("/parent/assignments");
  revalidatePath("/notifications");
  return {};
}
