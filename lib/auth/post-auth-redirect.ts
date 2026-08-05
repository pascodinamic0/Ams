import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { resolveLoginDestination } from "@/lib/auth/login-redirect";

type SchoolStatus = "pending" | "approved" | "suspended" | null;

type ProfileRow = {
  role: string | null;
  school_id: string | null;
  onboarding_completed_at: string | null;
};

async function loadProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await supabase
      .from("profiles")
      .select("role, school_id, onboarding_completed_at")
      .eq("id", userId)
      .maybeSingle();

    if (data) return data as ProfileRow;

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
  }

  return null;
}

export async function getPostAuthRedirect(options: {
  userId: string;
  redirect?: string | null;
  intent?: string | null;
  /** Prefer the client that just established the session (OAuth callback). */
  supabase?: SupabaseClient;
}): Promise<string> {
  const supabase = options.supabase ?? (await createClient());
  const profile = await loadProfile(supabase, options.userId);

  const role = profile?.role ?? null;
  const needsSchool = role !== "super_admin" && !profile?.school_id;

  if (needsSchool || options.intent === "register") {
    const { data: ownedSchool } = await supabase
      .from("schools")
      .select("id")
      .eq("owner_id", options.userId)
      .maybeSingle();

    if (!ownedSchool && !profile?.school_id) {
      return "/register/complete";
    }
  }

  if (!profile?.onboarding_completed_at) {
    return "/onboarding";
  }

  let schoolStatus: SchoolStatus = null;
  if (profile?.school_id) {
    const { data: school } = await supabase
      .from("schools")
      .select("status")
      .eq("id", profile.school_id)
      .single();
    schoolStatus = (school?.status as SchoolStatus) ?? null;
  }

  return resolveLoginDestination({
    role,
    schoolStatus,
    redirect: options.redirect,
  });
}
