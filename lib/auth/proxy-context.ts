import { createServerClient } from "@supabase/ssr";
import { type User } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import type { SubscriptionStatus } from "@/lib/billing/types";
import {
  beginAuthRefresh,
  endAuthRefresh,
  readAuthCookie,
  readCachedAuth,
  writeCachedAuth,
} from "@/lib/auth/auth-context-cache";
import { supabaseFetch } from "@/lib/supabase/fetch";
import { normalizeRole, type UserRole } from "./rbac";
import { shouldNeedStructureSetup } from "./structure-setup";

/** Never hold a click longer than this waiting for the profile query. */
const PROXY_AUTH_DEADLINE_MS = 1_500;

export type ProxyAuthContext = {
  role: UserRole;
  schoolId: string | null;
  schoolStatus: "pending" | "approved" | "suspended" | null;
  billingExempt: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  needsOnboarding: boolean;
  needsStructureSetup: boolean;
  passwordSetupRequired: boolean;
  name: string;
  email: string;
  avatarUrl: string | null;
  branchId: string | null;
  schoolName: string | null;
  schoolLogoUrl: string | null;
};

type SchoolEmbed = {
  name?: string | null;
  logo_url?: string | null;
  status?: ProxyAuthContext["schoolStatus"];
  structure_setup_completed_at?: string | null;
  billing_exempt?: boolean | null;
  subscription_status?: SubscriptionStatus | null;
};

type CookiePair = { name: string; value: string };

async function loadProxyAuthContext(
  cookies: CookiePair[],
  user: User
): Promise<ProxyAuthContext | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return cookies;
      },
      setAll() {},
    },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      name,
      role,
      school_id,
      branch_id,
      avatar_url,
      onboarding_completed_at,
      password_setup_required,
      schools(
        name,
        logo_url,
        status,
        structure_setup_completed_at,
        billing_exempt,
        subscription_status
      )
    `
    )
    .eq("id", user.id)
    .single();

  if (!profile?.role) return null;

  const role = normalizeRole(profile.role);
  const school = (Array.isArray(profile.schools)
    ? profile.schools[0]
    : profile.schools) as SchoolEmbed | null;
  const schoolStatus = school?.status ?? null;
  const structureSetupCompletedAt = school?.structure_setup_completed_at ?? null;
  const billingExempt = Boolean(school?.billing_exempt);
  const subscriptionStatus = school
    ? (school.subscription_status ?? "none")
    : null;
  const name = profile.name?.trim() || user.email?.split("@")[0] || "User";

  return {
    role,
    schoolId: profile.school_id,
    schoolStatus,
    billingExempt,
    subscriptionStatus,
    needsOnboarding: !profile.onboarding_completed_at,
    needsStructureSetup: shouldNeedStructureSetup({
      role,
      schoolStatus,
      structureSetupCompletedAt,
    }),
    passwordSetupRequired: Boolean(profile.password_setup_required),
    name,
    email: user.email ?? "",
    avatarUrl: profile.avatar_url ?? null,
    branchId: profile.branch_id ?? null,
    schoolName: school?.name ?? null,
    schoolLogoUrl: school?.logo_url ?? null,
  };
}

function remember(userId: string, value: ProxyAuthContext | null) {
  if (value) writeCachedAuth(userId, value);
}

async function refreshInBackground(cookies: CookiePair[], user: User) {
  if (!beginAuthRefresh(user.id)) return;
  try {
    remember(user.id, await loadProxyAuthContext(cookies, user));
  } catch {
    // Keep the previous context. A failed refresh must not block navigation.
  } finally {
    endAuthRefresh(user.id);
  }
}

function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<undefined>((resolve) => {
    timer = setTimeout(() => resolve(undefined), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Profile + school for route checks.
 * A recent result is reused so a click is not stuck on Supabase.
 * A cold lookup gives up after 1.5s and lets the loading shell render.
 */
export async function getProxyAuthContext(
  request: NextRequest,
  user: User
): Promise<ProxyAuthContext | null> {
  const cached = readCachedAuth(user.id);
  const cookies = request.cookies.getAll().map(({ name, value }) => ({ name, value }));

  if (cached?.fresh) return cached.value;

  if (cached) {
    void refreshInBackground(cookies, user);
    return cached.value;
  }

  const fromCookie = readAuthCookie(request, user.id);
  if (fromCookie) {
    void refreshInBackground(cookies, user);
    return fromCookie;
  }

  const loaded = loadProxyAuthContext(cookies, user).then((value) => {
    remember(user.id, value);
    return value;
  });
  const result = await withDeadline(loaded, PROXY_AUTH_DEADLINE_MS);
  if (result !== undefined) return result;
  return readCachedAuth(user.id)?.value ?? null;
}
