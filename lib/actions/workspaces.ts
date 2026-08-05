"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAcademicRole, canAccessSchool } from "@/lib/auth/assert";
import { normalizeRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  department: z.string().min(1).default("general"),
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
  const role = await assertAcademicRole();
  if (!role.ok) return { error: role.error };

  if (!role.profile.school_id && role.profile.role !== "super_admin") {
    return { error: "Your account is not linked to a school" as const };
  }

  const supabase = await createClient();
  return {
    supabase,
    profile: {
      id: role.profile.id,
      role: normalizeRole(role.profile.role),
      school_id: role.profile.school_id,
    },
  };
}

export async function createSchoolTask(
  input: z.infer<typeof taskSchema>
): Promise<{ error?: string }> {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task" };
  }

  const auth = await requireSchoolProfile();
  if ("error" in auth) return { error: auth.error };
  if (!auth.profile.school_id) {
    return { error: "Your account is not linked to a school" };
  }

  const { error } = await auth.supabase.from("school_tasks").insert({
    school_id: auth.profile.school_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    department: parsed.data.department,
    priority: parsed.data.priority,
    due_date: parsed.data.due_date || null,
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
): Promise<{ error?: string }> {
  const auth = await requireSchoolProfile();
  if ("error" in auth) return { error: auth.error };
  if (!auth.profile.school_id) {
    return { error: "Your account is not linked to a school" };
  }

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

export async function createDisciplineIncident(
  input: z.infer<typeof incidentSchema>
): Promise<{ error?: string }> {
  const parsed = incidentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid incident" };
  }

  const auth = await requireSchoolProfile();
  if ("error" in auth) return { error: auth.error };
  if (!auth.profile.school_id) {
    return { error: "Your account is not linked to a school" };
  }

  if (parsed.data.student_id) {
    const { data: student } = await auth.supabase
      .from("students")
      .select("id, school_id")
      .eq("id", parsed.data.student_id)
      .maybeSingle();
    if (
      !student ||
      !canAccessSchool(
        {
          id: auth.profile.id,
          role: auth.profile.role,
          school_id: auth.profile.school_id,
          branch_id: null,
        },
        student.school_id
      )
    ) {
      return { error: "Student not found in your school" };
    }
  }

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
  return {};
}

export async function updateDisciplineStatus(
  id: string,
  status: "open" | "monitoring" | "resolved" | "escalated"
): Promise<{ error?: string }> {
  const auth = await requireSchoolProfile();
  if ("error" in auth) return { error: auth.error };
  if (!auth.profile.school_id) {
    return { error: "Your account is not linked to a school" };
  }

  const { error } = await auth.supabase
    .from("discipline_incidents")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("school_id", auth.profile.school_id);

  if (error) return { error: error.message };

  revalidatePath("/academic");
  revalidatePath("/academic/discipline");
  return {};
}
