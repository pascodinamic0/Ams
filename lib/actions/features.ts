"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SCHOOL_FEATURE_KEYS, schoolFeatureKey } from "@/lib/db/features";

export async function toggleFeature(key: string, enabled: boolean) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("feature_toggles")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("feature_toggles")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("feature_toggles").insert({
      key,
      enabled,
      description: null,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/features");
  return {} as { error?: string };
}

export async function toggleSchoolFeature(
  schoolId: string,
  featureKey: string,
  enabled: boolean
) {
  if (!schoolId) {
    return await actionError("schoolRequired");
  }

  const validKey = SCHOOL_FEATURE_KEYS.some((f) => f.key === featureKey);
  if (!validKey) {
    return await actionError("unknownFeature");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return await actionError("notAuthenticated");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    if (profile?.role !== "academic_admin" || profile.school_id !== schoolId) {
      return await actionError("notAuthorizedManageFeatures");
    }
  }

  const key = schoolFeatureKey(schoolId, featureKey);
  return toggleFeature(key, enabled);
}
