import { createClient } from "@/lib/supabase/server";
import {
  MESSAGING_STAFF_ROLES,
  normalizeRole,
  type UserRole,
} from "@/lib/auth/rbac";

export type AuthedProfile = {
  id: string;
  role: UserRole;
  school_id: string | null;
  branch_id: string | null;
};

export async function getAuthedProfile(): Promise<AuthedProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    role: normalizeRole(profile.role),
    school_id: profile.school_id ?? null,
    branch_id: profile.branch_id ?? null,
  };
}

/** Super admins pass; others must match the target school. */
export function canAccessSchool(
  profile: AuthedProfile,
  schoolId: string | null | undefined
): boolean {
  if (!schoolId) return false;
  if (profile.role === "super_admin") return true;
  return profile.school_id === schoolId;
}

export async function assertMessagingStaff(): Promise<
  { ok: true; profile: AuthedProfile } | { ok: false; error: string }
> {
  const profile = await getAuthedProfile();
  if (!profile) return { ok: false, error: "Not authenticated" };
  if (!MESSAGING_STAFF_ROLES.includes(profile.role) && profile.role !== "parent") {
    return { ok: false, error: "Not authorized for messaging" };
  }
  return { ok: true, profile };
}

export async function assertConversationParticipant(
  conversationId: string
): Promise<
  | {
      ok: true;
      profile: AuthedProfile;
      conversation: { id: string; school_id: string };
      isParticipant: boolean;
    }
  | { ok: false; error: string }
> {
  const profile = await getAuthedProfile();
  if (!profile) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, school_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation) return { ok: false, error: "Conversation not found" };
  if (!canAccessSchool(profile, conversation.school_id)) {
    return { ok: false, error: "Not authorized for this conversation" };
  }

  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  const isMessagingStaff = MESSAGING_STAFF_ROLES.includes(profile.role);
  if (!participant && !isMessagingStaff && profile.role !== "parent") {
    return { ok: false, error: "Not a participant in this conversation" };
  }

  // Parents must already be participants — do not auto-join.
  if (!participant && profile.role === "parent") {
    return { ok: false, error: "Not a participant in this conversation" };
  }

  return {
    ok: true,
    profile,
    conversation,
    isParticipant: Boolean(participant),
  };
}
