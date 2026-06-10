"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { schoolFeatureKey } from "@/lib/db/features";

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
  const key = schoolFeatureKey(schoolId, featureKey);
  return toggleFeature(key, enabled);
}
