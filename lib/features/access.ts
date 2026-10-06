import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardForRole } from "@/lib/auth/rbac";
import {
  FEATURE_CATALOG,
  featureKeyFromStorageKey,
  requiredFeatureKeys,
  type FeatureDefinition,
} from "@/lib/features/catalog";

const CACHE_MS = 10_000;

type CacheEntry = { at: number; disabled: Set<string> };

type CacheGlobal = typeof globalThis & {
  __amsFeatureCache?: Map<string, CacheEntry>;
};

function memory(): Map<string, CacheEntry> {
  const g = globalThis as CacheGlobal;
  if (!g.__amsFeatureCache) g.__amsFeatureCache = new Map();
  return g.__amsFeatureCache;
}

export function invalidateSchoolFeatureCache(schoolId?: string) {
  if (!schoolId) {
    memory().clear();
    return;
  }
  memory().delete(schoolId);
}

function disabledFromRows(
  rows: { key: string; enabled: boolean | null }[]
): Set<string> {
  const explicit = new Map<string, boolean>();
  for (const row of rows) {
    const featureKey = featureKeyFromStorageKey(row.key);
    if (!featureKey) continue;
    explicit.set(featureKey, Boolean(row.enabled));
  }

  const disabled = new Set<string>();
  for (const feature of FEATURE_CATALOG) {
    const enabled = explicit.has(feature.key)
      ? explicit.get(feature.key)!
      : feature.defaultEnabled;
    if (!enabled) disabled.add(feature.key);
  }
  return disabled;
}

async function loadDisabledKeys(schoolId: string): Promise<Set<string>> {
  const admin = createAdminClient();
  if (!admin) return new Set();

  const { data, error } = await admin
    .from("feature_toggles")
    .select("key, enabled")
    .like("key", `school:${schoolId}:%`);

  if (error) {
    console.error("loadDisabledKeys error:", error.message);
    return new Set();
  }

  return disabledFromRows(data ?? []);
}

export async function getDisabledFeatureKeys(schoolId: string): Promise<Set<string>> {
  const hit = memory().get(schoolId);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.disabled;

  const disabled = await loadDisabledKeys(schoolId);
  memory().set(schoolId, { at: Date.now(), disabled });
  return disabled;
}

export async function isSchoolFeatureEnabled(
  schoolId: string,
  featureKey: string
): Promise<boolean> {
  const disabled = await getDisabledFeatureKeys(schoolId);
  return !disabled.has(featureKey);
}

/** First required module that is off for this school, if any. */
export async function disabledFeatureForPath(
  schoolId: string,
  pathname: string
): Promise<string | null> {
  const required = requiredFeatureKeys(pathname);
  if (required.length === 0) return null;
  const disabled = await getDisabledFeatureKeys(schoolId);
  return required.find((key) => disabled.has(key)) ?? null;
}

export function featureBlockDestination(role: string, blockedKey: string): string {
  const dashboard = getDashboardForRole(role);
  const dashboardBlocked = requiredFeatureKeys(dashboard).includes(blockedKey);
  if (dashboardBlocked || dashboard === "/module-off") return "/module-off";
  return dashboard;
}

export async function getHiddenNavHrefs(schoolId: string): Promise<string[]> {
  const disabled = await getDisabledFeatureKeys(schoolId);
  const hrefs = new Set<string>();

  for (const feature of FEATURE_CATALOG) {
    if (!disabled.has(feature.key)) continue;
    for (const href of feature.navHrefs) hrefs.add(href);
  }

  if (disabled.has("parent_portal")) {
    for (const feature of FEATURE_CATALOG) {
      for (const href of feature.navHrefs) {
        if (href === "/parent" || href.startsWith("/parent/")) hrefs.add(href);
      }
    }
  }

  if (disabled.has("student_portal")) {
    for (const feature of FEATURE_CATALOG) {
      for (const href of feature.navHrefs) {
        if (href === "/student" || href.startsWith("/student/")) hrefs.add(href);
      }
    }
  }

  return [...hrefs];
}

export type SchoolModuleState = FeatureDefinition & { enabled: boolean };

export async function getSchoolModuleStates(schoolId: string): Promise<SchoolModuleState[]> {
  const disabled = await getDisabledFeatureKeys(schoolId);
  return FEATURE_CATALOG.map((feature) => ({
    ...feature,
    enabled: !disabled.has(feature.key),
  }));
}
