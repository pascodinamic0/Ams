"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminClient } from "@/lib/supabase/admin";

type SchoolStatus = "pending" | "approved" | "suspended";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return await actionError("noPermissionSchoolApprovals");
  }

  return { user };
}

export async function updateSchoolStatus(schoolId: string, status: SchoolStatus) {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth;

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return adminResult;

  const admin = adminResult.client;

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "approved") {
    updates.public_site_enabled = true;
  } else if (status === "suspended") {
    updates.public_site_enabled = false;
  }

  const { error } = await admin
    .from("schools")
    .update(updates)
    .eq("id", schoolId);

  if (error) {
    console.error("updateSchoolStatus error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/schools");
  revalidatePath(`/admin/schools/${schoolId}`);
  revalidatePath("/schools");
  return { data: { status } };
}

export async function approveSchool(schoolId: string) {
  return updateSchoolStatus(schoolId, "approved");
}

export async function suspendSchool(schoolId: string) {
  return updateSchoolStatus(schoolId, "suspended");
}

export async function rejectSchool(schoolId: string) {
  return updateSchoolStatus(schoolId, "suspended");
}
