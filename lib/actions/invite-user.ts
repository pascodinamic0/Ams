"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPasswordSetupEmail } from "@/lib/auth/send-invite-email";
import { createClient } from "@/lib/supabase/server";
import { requireAdminClient } from "@/lib/supabase/admin";
import {
  inviteUserSchema,
  removeTeamMemberSchema,
  updateTeamMemberRoleSchema,
  type InvitableRole,
} from "@/lib/validations/team";

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
  if (!user) return { ok: false, ...(await actionError("notAuthenticated")) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "academic_admin" && profile?.role !== "super_admin") {
    return {
      ok: false,
      error: (await actionError("cannotManageTeam")).error,
    };
  }

  if (!profile.school_id || !profile.branch_id) {
    return { ok: false, ...(await actionError("noSchoolLinked")) };
  }

  const { data: school } = await supabase
    .from("schools")
    .select("status")
    .eq("id", profile.school_id)
    .single();

  if (school?.status !== "approved" && profile.role !== "super_admin") {
    return {
      ok: false,
      error: (await actionError("schoolMustBeApprovedTeam")).error,
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

async function applySchoolTeamMemberRoleUpdate(
  admin: SupabaseClient,
  input: {
    userId: string;
    role: InvitableRole;
    schoolId: string;
    currentRole: string;
    name?: string;
  }
): Promise<{ error?: string }> {
  if (
    input.currentRole === "academic_admin" &&
    input.role !== "academic_admin"
  ) {
    return await actionError("lastAcademicAdminChange");
  }

  const updatePayload: {
    role: InvitableRole;
    updated_at: string;
    name?: string;
  } = {
    role: input.role,
    updated_at: new Date().toISOString(),
  };

  if (input.name) {
    updatePayload.name = input.name;
  }

  const { error } = await admin
    .from("profiles")
    .update(updatePayload)
    .eq("id", input.userId)
    .eq("school_id", input.schoolId);

  if (error) {
    console.error("applySchoolTeamMemberRoleUpdate error:", error);
    return { error: error.message };
  }

  return {} as { error?: string };
}

export async function updateSchoolTeamMemberRole(input: {
  userId: string;
  role: InvitableRole;
}) {
  const parsed = updateTeamMemberRoleSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return await zodIssueError(first?.message);
  }

  const auth = await requireSchoolAdmin();
  if (!auth.ok) return { error: auth.error };

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const admin = adminResult.client;

  const { data: targetProfile, error: targetError } = await admin
    .from("profiles")
    .select("role, school_id")
    .eq("id", parsed.data.userId)
    .single();

  if (targetError || !targetProfile) {
    return await actionError("teamMemberNotFound");
  }

  if (targetProfile.role === "super_admin") {
    return await actionError("platformAdminCannotChange");
  }

  if (
    targetProfile.role === "parent" ||
    targetProfile.role === "student" ||
    !targetProfile.school_id
  ) {
    return await actionError("notSchoolTeamMember");
  }

  if (targetProfile.school_id !== auth.schoolId) {
    return await actionError("onlyOwnSchoolTeam");
  }

  if (targetProfile.role === parsed.data.role) {
    return { data: { userId: parsed.data.userId, unchanged: true as const } };
  }

  const result = await applySchoolTeamMemberRoleUpdate(admin, {
    userId: parsed.data.userId,
    role: parsed.data.role,
    schoolId: auth.schoolId,
    currentRole: targetProfile.role,
  });

  if (result.error) return { error: result.error };

  revalidatePath("/academic/team");
  revalidatePath("/admin/users");
  return { data: { userId: parsed.data.userId, roleUpdated: true as const } };
}

/**
 * Soft-remove a school team member: unlink them from the school (clear school/branch)
 * without deleting their auth account. Linked payroll payees are soft-deactivated.
 */
export async function removeSchoolTeamMember(input: { userId: string }) {
  const parsed = removeTeamMemberSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return await zodIssueError(first?.message);
  }

  const auth = await requireSchoolAdmin();
  if (!auth.ok) return { error: auth.error };

  if (parsed.data.userId === auth.user.id) {
    return await actionError("cannotRemoveSelf");
  }

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const admin = adminResult.client;

  const { data: targetProfile, error: targetError } = await admin
    .from("profiles")
    .select("role, school_id")
    .eq("id", parsed.data.userId)
    .single();

  if (targetError || !targetProfile) {
    return await actionError("teamMemberNotFound");
  }

  if (targetProfile.role === "super_admin") {
    return {
      ...(await actionError("platformAdminCannotRemove")),
    };
  }

  if (
    targetProfile.role === "parent" ||
    targetProfile.role === "student" ||
    !targetProfile.school_id
  ) {
    return await actionError("notSchoolTeamMember");
  }

  if (targetProfile.school_id !== auth.schoolId) {
    return await actionError("onlyOwnSchoolTeam");
  }

  if (targetProfile.role === "academic_admin") {
    const { count, error: countError } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("school_id", auth.schoolId)
      .eq("role", "academic_admin");

    if (countError) {
      console.error("removeSchoolTeamMember count error:", countError);
      return { error: countError.message };
    }

    if ((count ?? 0) <= 1) {
      return await actionError("lastAcademicAdminRemove");
    }
  }

  const { error: unlinkError } = await admin
    .from("profiles")
    .update({
      school_id: null,
      branch_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.userId)
    .eq("school_id", auth.schoolId);

  if (unlinkError) {
    console.error("removeSchoolTeamMember unlink error:", unlinkError);
    return { error: unlinkError.message };
  }

  // Soft-deactivate payroll payees linked to this profile (same school).
  const { error: staffError } = await admin
    .from("staff")
    .update({
      is_admin_payee: false,
      employment_status: "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("school_id", auth.schoolId)
    .eq("profile_id", parsed.data.userId);

  if (staffError) {
    // Profile is already unlinked; log and continue so remove still succeeds.
    console.error("removeSchoolTeamMember staff deactivate error:", staffError);
  }

  revalidatePath("/academic/team");
  revalidatePath("/admin/users");
  revalidatePath("/finance/payroll");
  revalidatePath("/operations/staff");
  return { data: { userId: parsed.data.userId, removed: true as const } };
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
    return await zodIssueError(first?.message);
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
      return await actionError("platformAdminCannotAdd");
    }

    if (existingProfile?.school_id && existingProfile.school_id !== schoolId) {
      return await actionError("emailLinkedOtherSchool");
    }

    if (existingProfile?.role) {
      const sameSchool = existingProfile.school_id === schoolId;
      const sameRole = existingProfile.role === parsed.data.role;

      if (sameSchool && sameRole) {
        const resent = await sendPasswordSetupEmail({
          admin,
          email,
          name: parsed.data.name,
          role: parsed.data.role,
          linkType: "recovery",
        });
        if (resent.error) {
          return {
            error:
              resent.error ||
              (await actionError("alreadyMemberThisRole")).error,
          };
        }
        await admin
          .from("profiles")
          .update({
            password_setup_required: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        revalidatePath("/academic/team");
        revalidatePath("/admin/users");
        return {
          data: {
            userId: existing.id,
            emailSent: true as const,
            resent: true as const,
          },
        };
      }

      if (sameSchool && !sameRole) {
        const result = await applySchoolTeamMemberRoleUpdate(admin, {
          userId: existing.id,
          role: parsed.data.role,
          schoolId,
          currentRole: existingProfile.role,
          name: parsed.data.name,
        });

        if (result.error) return { error: result.error };

        revalidatePath("/academic/team");
        revalidatePath("/admin/users");
        return {
          data: {
            userId: existing.id,
            emailSent: false as const,
            roleUpdated: true as const,
          },
        };
      }

      return await actionError("emailRegisteredDifferentAccess");
    }

    const attached = await sendPasswordSetupEmail({
      admin,
      email,
      name: parsed.data.name,
      role: parsed.data.role,
      linkType: "recovery",
    });
    if (attached.error || !attached.user) {
      return { error: attached.error ?? (await actionError("inviteEmailFailed")).error };
    }

    const { error: attachProfileError } = await admin.from("profiles").upsert(
      {
        id: existing.id,
        name: parsed.data.name,
        role: parsed.data.role,
        school_id: schoolId,
        branch_id: branchId,
        password_setup_required: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (attachProfileError) {
      return { error: attachProfileError.message };
    }

    revalidatePath("/academic/team");
    revalidatePath("/admin/users");
    return {
      data: {
        userId: existing.id,
        emailSent: true as const,
      },
    };
  }

  const invited = await sendPasswordSetupEmail({
    admin,
    email,
    name: parsed.data.name,
    role: parsed.data.role,
    linkType: "invite",
  });

  if (invited.error || !invited.user) {
    console.error("inviteSchoolUser invite error:", invited.error);
    if (invited.user) {
      await admin.auth.admin.deleteUser(invited.user.id);
    }
    if (invited.error) return { error: invited.error };
    return await actionError("inviteEmailFailed");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: invited.user.id,
      name: parsed.data.name,
      role: parsed.data.role,
      school_id: schoolId,
      branch_id: branchId,
      password_setup_required: true,
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
