"use server";

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
  return {};
}

export async function toggleSchoolFeature(
  schoolId: string,
  featureKey: string,
  enabled: boolean
) {
  if (!schoolId) {
    return { error: "School is required" };
  }

  const validKey = SCHOOL_FEATURE_KEYS.some((f) => f.key === featureKey);
  if (!validKey) {
    return { error: "Unknown feature" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    if (profile?.role !== "academic_admin" || profile.school_id !== schoolId) {
      return { error: "Not authorized to manage features for this school" };
    }
  }

  const key = schoolFeatureKey(schoolId, featureKey);
  return toggleFeature(key, enabled);
}
