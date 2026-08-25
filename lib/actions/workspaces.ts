"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  DISCIPLINE_ROLES,
  TASK_WORKSPACE_ROLES,
  normalizeRole,
  type UserRole,
} from "@/lib/auth/rbac";
import { createNotifications } from "@/lib/services/notifications";
import { createAdminClient } from "@/lib/supabase/admin";

const taskSchema = z.object({
  title: z.string().min(1, "titleRequired"),
  description: z.string().optional(),
  /** "unassigned" | "everyone" | profile uuid */
  assignee: z
    .union([z.literal("unassigned"), z.literal("everyone"), z.string().uuid()])
    .default("unassigned"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.string().optional(),
});

const incidentSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    severity: z.enum(["low", "medium", "high"]).default("medium"),
    student_id: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.string().uuid().optional()
    ),
    incident_date: z.string().optional(),
    evidence_url: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.string().url("invalidPhotoUrl").optional()
    ),
  })
  .refine((data) => Boolean(data.title?.trim() || data.evidence_url), {
    message: "incidentTitleOrPhotoRequired",
  });

async function requireSchoolProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return await actionError("noSchoolLinked");
  }

  return { supabase, profile };
}

async function requireDisciplineProfile() {
  const auth = await requireSchoolProfile();
  if ("error" in auth) return auth;

  const role = normalizeRole(auth.profile.role);
  if (role !== "super_admin" && !DISCIPLINE_ROLES.includes(role)) {
    return await actionError("disciplineTeacherOnly");
  }

  return auth;
}

function canIdentifyDisciplineStudent(role: string | null | undefined): boolean {
  const normalized = normalizeRole(role);
  return (
    normalized === "super_admin" ||
    DISCIPLINE_ROLES.includes(normalized) ||
    TASK_WORKSPACE_ROLES.includes(normalized)
  );
}

function revalidateDisciplinePaths() {
  revalidatePath("/academic");
  revalidatePath("/academic/discipline");
  revalidatePath("/academic/tasks");
  revalidatePath("/teacher/discipline");
  revalidatePath("/notifications");
}

async function notifyAdminsOfUnidentifiedIncident(options: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  schoolId: string;
  reporterId: string;
  title: string;
  hasPhoto: boolean;
}) {
  const adminClient = createAdminClient();
  const client = adminClient ?? options.supabase;
  const adminRoles: UserRole[] = ["super_admin", ...TASK_WORKSPACE_ROLES];
  const { data: admins } = await client
    .from("profiles")
    .select("id")
    .eq("school_id", options.schoolId)
    .in("role", adminRoles);

  const recipients = (admins ?? [])
    .map((admin) => admin.id)
    .filter((id) => id !== options.reporterId);

  if (recipients.length === 0) return;

  const tn = await getTranslations("notifications");
  await createNotifications(
    recipients.map((userId) => ({
      userId,
      title: tn("unidentifiedDisciplineIncident"),
      body: tn("unidentifiedDisciplineIncidentBody", {
        title: options.title,
        photo: options.hasPhoto
          ? tn("unidentifiedDisciplinePhotoAttached")
          : tn("unidentifiedDisciplineNoPhoto"),
      }),
      url: "/academic/tasks",
      tag: "discipline-identify",
    }))
  );
}

export async function createSchoolTask(input: z.infer<typeof taskSchema>) {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return await zodIssueError(parsed.error.issues[0]?.message);
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
    if (!member) return await actionError("selectedStaffNotFound");

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
  return {} as { error?: string };
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
  return {} as { error?: string };
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

  if (!task) return await actionError("taskNotFound");

  // Pending expense approvals must be decided (Approve/Reject), not deleted —
  // otherwise finance is left with an orphaned pending expense.
  if (task.related_type === "expense" && task.status !== "done") {
    return {
      error: (await actionError("rejectOrApproveExpense")).error,
    };
  }

  if (task.related_type === "discipline_incident" && task.status !== "done") {
    return {
      error: (await actionError("identifyStudentInsteadOfDelete")).error,
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
  return {} as { error?: string };
}

export async function createDisciplineIncident(
  input: z.infer<typeof incidentSchema>
) {
  const parsed = incidentSchema.safeParse(input);
  if (!parsed.success) {
    return await zodIssueError(parsed.error.issues[0]?.message);
  }

  const auth = await requireDisciplineProfile();
  if ("error" in auth) return auth;

  const t = await getTranslations("academic");
  const title =
    parsed.data.title?.trim() ||
    (parsed.data.student_id
      ? t("photoIncidentTitle")
      : t("unidentifiedIncidentTitle"));
  const studentId = parsed.data.student_id || null;
  const evidenceUrl = parsed.data.evidence_url || null;

  const { data: incident, error } = await auth.supabase
    .from("discipline_incidents")
    .insert({
      school_id: auth.profile.school_id,
      title,
      description: parsed.data.description?.trim() || null,
      severity: parsed.data.severity,
      student_id: studentId,
      evidence_url: evidenceUrl,
      incident_date:
        parsed.data.incident_date || new Date().toISOString().slice(0, 10),
      reported_by: auth.profile.id,
    })
    .select("id, student_id, task_id")
    .single();

  if (error) return { error: error.message };

  if (!incident.student_id) {
    await notifyAdminsOfUnidentifiedIncident({
      supabase: auth.supabase,
      schoolId: auth.profile.school_id,
      reporterId: auth.profile.id,
      title,
      hasPhoto: Boolean(evidenceUrl),
    });
  }

  revalidateDisciplinePaths();
  return {} as { error?: string };
}

export async function identifyDisciplineStudent(
  incidentId: string,
  studentId: string
) {
  if (!z.string().uuid().safeParse(incidentId).success) {
    return await actionError("invalidIncident");
  }
  if (!z.string().uuid().safeParse(studentId).success) {
    return await actionError("studentNotFound");
  }

  const auth = await requireSchoolProfile();
  if ("error" in auth) return auth;

  if (!canIdentifyDisciplineStudent(auth.profile.role)) {
    return await actionError("notAuthorized");
  }

  const { data: incident } = await auth.supabase
    .from("discipline_incidents")
    .select("id, student_id")
    .eq("id", incidentId)
    .eq("school_id", auth.profile.school_id)
    .maybeSingle();

  if (!incident) return await actionError("invalidIncident");
  if (incident.student_id) {
    return await actionError("incidentAlreadyIdentified");
  }

  const { data: student } = await auth.supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("school_id", auth.profile.school_id)
    .maybeSingle();

  if (!student) return await actionError("studentNotFound");

  const { error } = await auth.supabase
    .from("discipline_incidents")
    .update({
      student_id: student.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", incident.id)
    .eq("school_id", auth.profile.school_id);

  if (error) return { error: error.message };

  revalidateDisciplinePaths();
  return {} as { error?: string };
}

export async function updateDisciplineStatus(
  id: string,
  status: "open" | "monitoring" | "resolved" | "escalated"
) {
  const auth = await requireDisciplineProfile();
  if ("error" in auth) return auth;

  const { data: incident, error } = await auth.supabase
    .from("discipline_incidents")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("school_id", auth.profile.school_id)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!incident) return await actionError("invalidIncident");

  revalidateDisciplinePaths();
  return {} as { error?: string };
}
