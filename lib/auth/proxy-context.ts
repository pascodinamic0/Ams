import { createServerClient } from "@supabase/ssr";
import { type User } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { normalizeRole, type UserRole } from "./rbac";

export type ProxyAuthContext = {
  role: UserRole;
  schoolId: string | null;
  schoolStatus: "pending" | "approved" | "suspended" | null;
  needsOnboarding: boolean;
  name: string;
  email: string;
  avatarUrl: string | null;
};

/**
 * Single profile (+ optional school) fetch for edge proxy auth checks.
 * Replaces separate school-access + onboarding queries.
 */
export async function getProxyAuthContext(
  request: NextRequest,
  user: User
): Promise<ProxyAuthContext | null> {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, school_id, avatar_url, onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (!profile?.role) return null;

  const role = normalizeRole(profile.role);
  let schoolStatus: ProxyAuthContext["schoolStatus"] = null;

  if (profile.school_id) {
    const { data: school } = await supabase
      .from("schools")
      .select("status")
      .eq("id", profile.school_id)
      .single();
    schoolStatus = (school?.status as ProxyAuthContext["schoolStatus"]) ?? null;
  }

  const name =
    profile.name?.trim() || user.email?.split("@")[0] || "User";

  return {
    role,
    schoolId: profile.school_id,
    schoolStatus,
    needsOnboarding: !profile.onboarding_completed_at,
    name,
    email: user.email ?? "",
    avatarUrl: profile.avatar_url ?? null,
  };
}
