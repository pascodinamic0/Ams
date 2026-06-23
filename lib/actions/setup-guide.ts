"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAcademicAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "academic_admin" || !profile.school_id) {
    return { error: "Only school administrators can manage the setup guide" as const };
  }

  return { user, schoolId: profile.school_id };
}

export async function dismissSetupGuide() {
  const auth = await requireAcademicAdmin();
  if ("error" in auth) return auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      setup_guide_dismissed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id);

  if (error) return { error: error.message };

  revalidatePath("/academic", "layout");
  return {};
}

export async function restoreSetupGuide() {
  const auth = await requireAcademicAdmin();
  if ("error" in auth) return auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      setup_guide_dismissed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id);

  if (error) return { error: error.message };

  revalidatePath("/academic", "layout");
  return {};
}
