"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SchoolStatus = "pending" | "approved" | "suspended";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { error: "You do not have permission to manage school approvals" as const };
  }

  return { user };
}

export async function updateSchoolStatus(schoolId: string, status: SchoolStatus) {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth;

  const admin = createAdminClient();
  if (!admin) return { error: "Server configuration error" };

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
