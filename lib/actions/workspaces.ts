"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DISCIPLINE_ROLES, normalizeRole } from "@/lib/auth/rbac";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  /** "unassigned" | "everyone" | profile uuid */
  assignee: z
    .union([z.literal("unassigned"), z.literal("everyone"), z.string().uuid()])
    .default("unassigned"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.string().optional(),
});

const incidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  severity: z.enum(["low", "medium", "high"]).default("medium"),
  student_id: z.string().uuid().optional(),
  incident_date: z.string().optional(),
});

async function requireSchoolProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return { error: "Your account is not linked to a school" as const };
  }

  return { supabase, profile };
}

async function requireDisciplineProfile() {
  const auth = await requireSchoolProfile();
  if ("error" in auth) return auth;

  const role = normalizeRole(auth.profile.role);
  if (role !== "super_admin" && !DISCIPLINE_ROLES.includes(role)) {
    return { error: "Discipline is only available on teacher-level accounts" as const };
  }

  return auth;
}

export async function createSchoolTask(input: z.infer<typeof taskSchema>) {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task" };
  }

  const auth = await requireSchoolProfile();
  if ("error" in auth) return auth;

  const { assignee, title, description, priority, due_date } = parsed.data;
  let assignedTo: string | null = null;
  let department = "general";

  if (assignee === "everyone") {
    department = "everyone";
  } else if (assignee !== "unassigned") {
    const { data: member, error: memberError } = await auth.supabase
      .from("profiles")
      .select("id")
      .eq("id", assignee)
      .eq("school_id", auth.profile.school_id)
      .neq("role", "student")
      .neq("role", "parent")
      .maybeSingle();

    if (memberError) return { error: memberError.message };
    if (!member) return { error: "Selected staff member was not found" };

    assignedTo = member.id;
  }

  const { error } = await auth.supabase.from("school_tasks").insert({
    school_id: auth.profile.school_id,
    title,
    description: description || null,
    department,
    priority,
    due_date: due_date || null,
    assigned_to: assignedTo,
    created_by: auth.profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/academic");
  revalidatePath("/academic/tasks");
  return {};
}

export async function updateSchoolTaskStatus(
  id: string,
  status: "todo" | "in_progress" | "blocked" | "done"
) {
  const auth = await requireSchoolProfile();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase
    .from("school_tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("school_id", auth.profile.school_id);

  if (error) return { error: error.message };

  revalidatePath("/academic");
  revalidatePath("/academic/tasks");
  return {};
}

export async function deleteSchoolTask(id: string) {
  const auth = await requireSchoolProfile();
  if ("error" in auth) return auth;

  const { data: task } = await auth.supabase
    .from("school_tasks")
    .select("id, related_type, status")
    .eq("id", id)
    .eq("school_id", auth.profile.school_id)
    .maybeSingle();

  if (!task) return { error: "Task not found" };

  // Pending expense approvals must be decided (Approve/Reject), not deleted —
  // otherwise finance is left with an orphaned pending expense.
  if (task.related_type === "expense" && task.status !== "done") {
    return {
      error: "Reject or approve this expense instead of deleting the task",
    };
  }

  const { error } = await auth.supabase
    .from("school_tasks")
    .delete()
    .eq("id", id)
    .eq("school_id", auth.profile.school_id);

  if (error) return { error: error.message };

  revalidatePath("/academic");
  revalidatePath("/academic/tasks");
  return {};
}

export async function createDisciplineIncident(
  input: z.infer<typeof incidentSchema>
) {
  const parsed = incidentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid incident" };
  }

  const auth = await requireDisciplineProfile();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase.from("discipline_incidents").insert({
    school_id: auth.profile.school_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    severity: parsed.data.severity,
    student_id: parsed.data.student_id || null,
    incident_date: parsed.data.incident_date || new Date().toISOString().slice(0, 10),
    reported_by: auth.profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/academic");
  revalidatePath("/academic/discipline");
  revalidatePath("/teacher/discipline");
  return {};
}

export async function updateDisciplineStatus(
  id: string,
  status: "open" | "monitoring" | "resolved" | "escalated"
) {
  const auth = await requireDisciplineProfile();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase
    .from("discipline_incidents")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("school_id", auth.profile.school_id);

  if (error) return { error: error.message };

  revalidatePath("/academic");
  revalidatePath("/academic/discipline");
  revalidatePath("/teacher/discipline");
  return {};
}
