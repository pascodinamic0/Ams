import { createClient } from "@/lib/supabase/server";

export const SCHOOL_FEATURE_KEYS = [
  { key: "online_admissions", label: "Online admissions", description: "Public admission form on school website" },
  { key: "parent_portal", label: "Parent portal", description: "Parent dashboard and messaging" },
  { key: "student_portal", label: "Student portal", description: "Student assignments and grades" },
  { key: "messaging", label: "Messaging", description: "In-app messaging between users" },
  { key: "library", label: "Library", description: "Library catalog and book issues" },
  { key: "transport", label: "Transport", description: "Bus routes and student transport" },
  { key: "online_payments", label: "Online payments", description: "Parent fee payment portal" },
] as const;

export type FeatureToggleItem = {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
};

export type SchoolFeatureRow = {
  school_id: string;
  school_name: string;
  features: {
    key: string;
    label: string;
    description: string;
    enabled: boolean;
    toggle_id: string | null;
  }[];
};

function schoolFeatureKey(schoolId: string, featureKey: string) {
  return `school:${schoolId}:${featureKey}`;
}

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

  const toggleMap = new Map<string, { id: string; enabled: boolean }>();
  for (const t of togglesResult.data ?? []) {
    toggleMap.set(t.key, { id: t.id, enabled: t.enabled ?? false });
  }

  return (schoolsResult.data ?? []).map((school) => ({
    school_id: school.id,
    school_name: school.name,
    features: SCHOOL_FEATURE_KEYS.map((f) => {
      const fullKey = schoolFeatureKey(school.id, f.key);
      const toggle = toggleMap.get(fullKey);
      return {
        key: f.key,
        label: f.label,
        description: f.description,
        enabled: toggle?.enabled ?? false,
        toggle_id: toggle?.id ?? null,
      };
    }),
  }));
}

export { schoolFeatureKey };
