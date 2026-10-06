import { createClient } from "@/lib/supabase/server";
import {
  FEATURE_CATALOG,
  FEATURE_GROUPS,
  schoolFeatureStorageKey,
  type FeatureGroup,
} from "@/lib/features/catalog";
import { getDisabledFeatureKeys } from "@/lib/features/access";

export const SCHOOL_FEATURE_KEYS = FEATURE_CATALOG.map((feature) => ({
  key: feature.key,
  label: feature.label,
  description: feature.description,
  group: feature.group,
}));

export type FeatureToggleItem = {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
};

export type SchoolFeatureState = {
  key: string;
  group: FeatureGroup;
  label: string;
  description: string;
  enabled: boolean;
  toggle_id: string | null;
};

export type SchoolFeatureRow = {
  school_id: string;
  school_name: string;
  features: SchoolFeatureState[];
};

export const FEATURE_GROUP_ORDER = FEATURE_GROUPS;

export async function getFeatureToggles(): Promise<FeatureToggleItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_toggles")
    .select("id, key, enabled, description")
    .order("key");

  if (error) {
    console.error("getFeatureToggles error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    enabled: row.enabled ?? false,
    description: row.description,
  }));
}

export async function getSchoolFeatureMatrix(): Promise<SchoolFeatureRow[]> {
  const supabase = await createClient();

  const [schoolsResult, togglesResult] = await Promise.all([
    supabase.from("schools").select("id, name").order("name"),
    supabase.from("feature_toggles").select("id, key, enabled").like("key", "school:%"),
  ]);

  if (schoolsResult.error) {
    console.error("getSchoolFeatureMatrix schools error:", schoolsResult.error);
    return [];
  }

  const togglesBySchool = new Map<string, Map<string, { id: string; enabled: boolean }>>();
  for (const toggle of togglesResult.data ?? []) {
    const parts = toggle.key.split(":");
    if (parts.length < 3 || parts[0] !== "school") continue;
    const schoolId = parts[1];
    const featureKey = parts.slice(2).join(":");
    const schoolToggles = togglesBySchool.get(schoolId) ?? new Map();
    schoolToggles.set(featureKey, { id: toggle.id, enabled: toggle.enabled ?? false });
    togglesBySchool.set(schoolId, schoolToggles);
  }

  return (schoolsResult.data ?? []).map((school) => {
    const schoolToggles = togglesBySchool.get(school.id);
    return {
      school_id: school.id,
      school_name: school.name,
      features: FEATURE_CATALOG.map((feature) => {
        const toggle = schoolToggles?.get(feature.key);
        return {
          key: feature.key,
          group: feature.group,
          label: feature.label,
          description: feature.description,
          enabled: toggle ? toggle.enabled : feature.defaultEnabled,
          toggle_id: toggle?.id ?? null,
        };
      }),
    };
  });
}

export { schoolFeatureStorageKey as schoolFeatureKey, getDisabledFeatureKeys };
