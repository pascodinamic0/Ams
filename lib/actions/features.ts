"use server";

import { revalidatePath } from "next/cache";
import { assertRole, assertRoleAndSchool } from "@/lib/auth/assert";
import { createClient } from "@/lib/supabase/server";
import { SCHOOL_FEATURE_KEYS, schoolFeatureKey } from "@/lib/db/features";

async function upsertFeatureToggle(key: string, enabled: boolean) {
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

export async function toggleFeature(key: string, enabled: boolean) {
  const access = await assertRole(["super_admin"]);
  if (!access.ok) return { error: access.error };

  return upsertFeatureToggle(key, enabled);
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

  const access = await assertRoleAndSchool(["academic_admin"], schoolId);
  if (!access.ok) return { error: "Not authorized to manage features for this school" };

  const key = schoolFeatureKey(schoolId, featureKey);
  return upsertFeatureToggle(key, enabled);
}
