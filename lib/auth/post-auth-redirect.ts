import { createClient } from "@/lib/supabase/server";
import { resolveLoginDestination } from "@/lib/auth/login-redirect";

type SchoolStatus = "pending" | "approved" | "suspended" | null;

export async function getPostAuthRedirect(options: {
  userId: string;
  redirect?: string | null;
  intent?: string | null;
}): Promise<string> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, onboarding_completed_at")
    .eq("id", options.userId)
    .single();

  const role = profile?.role ?? null;
  const needsSchool =
    role !== "super_admin" && !profile?.school_id;

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
