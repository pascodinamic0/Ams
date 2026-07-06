"use server";

import { revalidatePath } from "next/cache";
import { buildAuthCallbackUrl } from "@/lib/auth/app-url";
import { createClient } from "@/lib/supabase/server";
import { requireAdminClient } from "@/lib/supabase/admin";
import { inviteUserSchema, type InvitableRole } from "@/lib/validations/team";

type InviteAuth =
  | { ok: false; error: string }
  | {
      ok: true;
      user: { id: string };
      schoolId: string;
      branchId: string;
      isSuperAdmin: boolean;
    };

async function requireSchoolAdmin(): Promise<InviteAuth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "academic_admin" && profile?.role !== "super_admin") {
    return { ok: false, error: "You do not have permission to invite team members" };
  }

  if (!profile.school_id || !profile.branch_id) {
    return { ok: false, error: "Your account is not linked to a school" };
  }

  const { data: school } = await supabase
    .from("schools")
    .select("status")
    .eq("id", profile.school_id)
    .single();

  if (school?.status !== "approved" && profile.role !== "super_admin") {
    return {
      ok: false,
      error: "Your school must be approved before you can invite team members",
    };
  }

  return {
    ok: true,
    user,
    schoolId: profile.school_id,
    branchId: profile.branch_id,
    isSuperAdmin: profile.role === "super_admin",
  };
}

export async function inviteSchoolUser(input: {
  email: string;
  name: string;
  role: InvitableRole;
  schoolId?: string;
  branchId?: string;
}) {
  const parsed = inviteUserSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Invalid input" };
  }

  const auth = await requireSchoolAdmin();
  if (!auth.ok) return { error: auth.error };

  const schoolId =
    input.schoolId && auth.isSuperAdmin ? input.schoolId : auth.schoolId;
  const branchId =
    input.branchId && auth.isSuperAdmin ? input.branchId : auth.branchId;

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const admin = adminResult.client;

  const email = parsed.data.email.toLowerCase().trim();

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (existing) {
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("role, school_id")
      .eq("id", existing.id)
      .single();

    if (existingProfile?.role === "super_admin") {
      return {
        error:
          "This email belongs to a platform administrator and cannot be added to a school",
      };
    }

    if (existingProfile?.school_id && existingProfile.school_id !== schoolId) {
      return { error: "This email is already linked to another school" };
    }

    if (existingProfile?.role) {
      const sameSchool = existingProfile.school_id === schoolId;
      const sameRole = existingProfile.role === parsed.data.role;

      if (sameSchool && sameRole) {
        return {
          error: "This email is already a member of your school with this role",
        };
      }

      return {
        error:
          "This email is already registered with a different access level. Ask them to sign in with their existing account, or use a different email.",
      };
    }
  }

  const redirectTo = buildAuthCallbackUrl({ redirect: "/reset-password" });

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo,
      data: {
        name: parsed.data.name,
        role: parsed.data.role,
      },
    }
  );

  if (inviteError || !invited.user) {
    console.error("inviteSchoolUser invite error:", inviteError);
    return { error: inviteError?.message ?? "Failed to send invitation email" };
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: invited.user.id,
      name: parsed.data.name,
      role: parsed.data.role,
      school_id: schoolId,
      branch_id: branchId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    await admin.auth.admin.deleteUser(invited.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/academic/team");
  revalidatePath("/admin/users");
  return {
    data: {
      userId: invited.user.id,
      emailSent: true as const,
    },
  };
}
