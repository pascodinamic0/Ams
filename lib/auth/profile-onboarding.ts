import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import { normalizeRole, type UserRole } from "./rbac";

export type ProfileOnboardingState = {
  needsOnboarding: boolean;
  role: UserRole;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export async function getProfileOnboardingState(
  request: NextRequest,
  userId: string
): Promise<ProfileOnboardingState | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, avatar_url, onboarding_completed_at")
    .eq("id", userId)
    .single();

  if (!profile?.role) return null;

  const role = normalizeRole(profile.role);
  const name =
    profile.name?.trim() ||
    user.email?.split("@")[0] ||
    "User";

  return {
    needsOnboarding: !profile.onboarding_completed_at,
    role,
    name,
    email: user.email ?? "",
    avatarUrl: profile.avatar_url ?? null,
  };
}

/**
 * Routes that must stay reachable before profile onboarding completes.
 * Exact `/onboarding` only — `/onboarding/school` is structure setup and
 * should not bypass the profile-onboarding gate.
 */
export const PROFILE_ONBOARDING_EXEMPT_PATHS = [
  "/onboarding",
  "/register/complete",
  "/reset-password",
  "/auth/callback",
  "/auth/confirm",
  "/auth/hash",
];

export function isProfileOnboardingExempt(pathname: string): boolean {
  return PROFILE_ONBOARDING_EXEMPT_PATHS.some((path) => {
    if (path === "/onboarding") {
      return pathname === "/onboarding";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}
