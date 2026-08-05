import { createClient } from "@/lib/supabase/server";
import {
  ACADEMIC_PORTAL_ROLES,
  FINANCE_PORTAL_ROLES,
  MESSAGING_STAFF_ROLES,
  OPERATIONS_PORTAL_ROLES,
  normalizeRole,
  type UserRole,
} from "@/lib/auth/rbac";

export type AuthedProfile = {
  id: string;
  role: UserRole;
  school_id: string | null;
  branch_id: string | null;
};

type AssertOk = { ok: true; profile: AuthedProfile };
type AssertErr = { ok: false; error: string };
export type AssertResult = AssertOk | AssertErr;

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

export async function assertAuthenticated(): Promise<AssertResult> {
  const profile = await getAuthedProfile();
  if (!profile) return { ok: false, error: "Not authenticated" };
  return { ok: true, profile };
}

export async function assertRole(
  allowed: readonly UserRole[]
): Promise<AssertResult> {
  const auth = await assertAuthenticated();
  if (!auth.ok) return auth;
  if (auth.profile.role === "super_admin") return auth;
  if (!allowed.includes(auth.profile.role)) {
    return { ok: false, error: "Not authorized" };
  }
  return auth;
}

export async function assertAcademicRole(): Promise<AssertResult> {
  return assertRole(ACADEMIC_PORTAL_ROLES);
}

export async function assertFinanceRole(): Promise<AssertResult> {
  return assertRole(FINANCE_PORTAL_ROLES);
}

export async function assertOperationsRole(): Promise<AssertResult> {
  return assertRole(OPERATIONS_PORTAL_ROLES);
}

export async function assertTeacherOrAcademic(): Promise<AssertResult> {
  return assertRole([...ACADEMIC_PORTAL_ROLES, "teacher"]);
}

export async function assertSchoolAccess(
  schoolId: string | null | undefined
): Promise<AssertResult> {
  const auth = await assertAuthenticated();
  if (!auth.ok) return auth;
  if (!canAccessSchool(auth.profile, schoolId)) {
    return { ok: false, error: "Not authorized for this school" };
  }
  return auth;
}

export async function assertRoleAndSchool(
  allowed: readonly UserRole[],
  schoolId: string | null | undefined
): Promise<AssertResult> {
  const auth = await assertRole(allowed);
  if (!auth.ok) return auth;
  if (!canAccessSchool(auth.profile, schoolId)) {
    return { ok: false, error: "Not authorized for this school" };
  }
  return auth;
}

export async function getBranchSchoolId(
  branchId: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("branches")
    .select("school_id")
    .eq("id", branchId)
    .maybeSingle();
  return data?.school_id ?? null;
}

export async function assertBranchAccess(
  branchId: string,
  allowed?: readonly UserRole[]
): Promise<AssertResult & { schoolId?: string }> {
  const schoolId = await getBranchSchoolId(branchId);
  if (!schoolId) return { ok: false, error: "Branch not found" };
  const auth = allowed
    ? await assertRoleAndSchool(allowed, schoolId)
    : await assertSchoolAccess(schoolId);
  if (!auth.ok) return auth;
  return { ...auth, schoolId };
}

export async function assertStudentAccess(
  studentId: string,
  allowed?: readonly UserRole[]
): Promise<AssertResult & { schoolId?: string }> {
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, school_id")
    .eq("id", studentId)
    .maybeSingle();
  if (!student) return { ok: false, error: "Student not found" };
  const auth = allowed
    ? await assertRoleAndSchool(allowed, student.school_id)
    : await assertSchoolAccess(student.school_id);
  if (!auth.ok) return auth;
  return { ...auth, schoolId: student.school_id };
}

export async function assertClassAccess(
  classId: string,
  allowed?: readonly UserRole[]
): Promise<AssertResult & { schoolId?: string; branchId?: string }> {
  const supabase = await createClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, branch_id, branches(school_id)")
    .eq("id", classId)
    .maybeSingle();
  if (!cls) return { ok: false, error: "Class not found" };
  const schoolId =
    (cls.branches as { school_id?: string } | null)?.school_id ?? null;
  if (!schoolId) return { ok: false, error: "Class school not found" };
  const auth = allowed
    ? await assertRoleAndSchool(allowed, schoolId)
    : await assertSchoolAccess(schoolId);
  if (!auth.ok) return auth;
  return { ...auth, schoolId, branchId: cls.branch_id };
}

export async function assertMessagingStaff(): Promise<AssertResult> {
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
