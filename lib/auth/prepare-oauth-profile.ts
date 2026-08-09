import type { SupabaseClient, User } from "@supabase/supabase-js";

type ProfileRow = {
  name: string | null;
  role: string | null;
  school_id: string | null;
  avatar_url: string | null;
  onboarding_completed_at: string | null;
};

function googleDisplayName(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const fullName =
    typeof meta.full_name === "string" ? meta.full_name.trim() : "";
  if (fullName) return fullName;
  const name = typeof meta.name === "string" ? meta.name.trim() : "";
  return name || null;
}

function googleAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  if (typeof meta.avatar_url === "string" && meta.avatar_url) {
    return meta.avatar_url;
  }
  if (typeof meta.picture === "string" && meta.picture) {
    return meta.picture;
  }
  return null;
}

async function loadProfileWithRetry(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await supabase
      .from("profiles")
      .select("name, role, school_id, avatar_url, onboarding_completed_at")
      .eq("id", userId)
      .maybeSingle();

    if (data) return data as ProfileRow;

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
  }

  return null;
}

/**
 * After Google (or other OAuth) sign-in, sync identity fields and skip the
 * profile onboarding wizard when the account is already ready for a portal.
 */
export async function prepareOAuthProfile(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const profile = await loadProfileWithRetry(supabase, user.id);
  if (!profile) return;

  const googleName = googleDisplayName(user);
  const googleAvatar = googleAvatarUrl(user);
  const emailLocalPart = user.email?.split("@")[0] ?? null;

  const updates: {
    name?: string;
    avatar_url?: string;
    onboarding_completed_at?: string;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  const currentName = profile.name?.trim() || null;
  if (
    googleName &&
    (!currentName || (emailLocalPart && currentName === emailLocalPart))
  ) {
    updates.name = googleName;
  }

  if (googleAvatar && !profile.avatar_url) {
    updates.avatar_url = googleAvatar;
  }

  let hasSchoolAccess =
    profile.role === "super_admin" || Boolean(profile.school_id);

  if (!hasSchoolAccess) {
    const { data: ownedSchool } = await supabase
      .from("schools")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    hasSchoolAccess = Boolean(ownedSchool);
  }

  const effectiveName = updates.name ?? currentName ?? googleName;

  if (!profile.onboarding_completed_at && hasSchoolAccess && effectiveName) {
    updates.onboarding_completed_at = new Date().toISOString();
  }

  const hasProfileChanges =
    updates.name !== undefined ||
    updates.avatar_url !== undefined ||
    updates.onboarding_completed_at !== undefined;

  if (!hasProfileChanges) return;

  await supabase.from("profiles").update(updates).eq("id", user.id);
}
