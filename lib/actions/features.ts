"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/i18n/action-error";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { isKnownFeatureKey, schoolFeatureStorageKey } from "@/lib/features/catalog";
import { invalidateSchoolFeatureCache } from "@/lib/features/access";
import { isPlatformOwner } from "@/lib/features/owner";

async function requirePlatformOwner() {
  const profile = await getCurrentProfile();
  if (!profile || !isPlatformOwner(profile.email, profile.role)) {
    return { profile: null, error: await actionError("notAuthorizedManageFeatures") };
  }
  return { profile, error: null };
}

export async function toggleFeature(key: string, enabled: boolean) {
  const gate = await requirePlatformOwner();
  if (gate.error) return gate.error;

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
  revalidatePath("/billing");
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

  if (!isKnownFeatureKey(featureKey)) {
    return await actionError("unknownFeature");
  }

  const gate = await requirePlatformOwner();
  if (gate.error) return gate.error;

  const key = schoolFeatureStorageKey(schoolId, featureKey);
  const result = await toggleFeature(key, enabled);
  if (!result.error) invalidateSchoolFeatureCache(schoolId);
  return result;
}
