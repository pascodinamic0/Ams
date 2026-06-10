"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inviteUserSchema, type InvitableRole } from "@/lib/validations/team";

function generateTempPassword(): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(16);
  let s = "";
  for (let i = 0; i < 16; i++) {
    s += chars[bytes[i]! % chars.length];
  }
  return s;
}

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

  const admin = createAdminClient();
  if (!admin) return { error: "Server configuration error" };

  const email = parsed.data.email.toLowerCase().trim();

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (existing) {
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("school_id")
      .eq("id", existing.id)
      .single();

    if (existingProfile?.school_id && existingProfile.school_id !== schoolId) {
      return { error: "This email is already linked to another school" };
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: existing.id,
        name: parsed.data.name,
        role: parsed.data.role,
        school_id: schoolId,
        branch_id: branchId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      return { error: profileError.message };
    }

    revalidatePath("/academic/team");
    revalidatePath("/admin/users");
    return { data: { userId: existing.id, existing: true as const } };
  }

  const tempPassword = generateTempPassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      name: parsed.data.name,
      role: parsed.data.role,
    },
  });

  if (createError || !created.user) {
    console.error("inviteSchoolUser create error:", createError);
    return { error: createError?.message ?? "Failed to create user" };
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: created.user.id,
      name: parsed.data.name,
      role: parsed.data.role,
      school_id: schoolId,
      branch_id: branchId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/academic/team");
  revalidatePath("/admin/users");
  return {
    data: {
      userId: created.user.id,
      existing: false as const,
      tempPassword,
    },
  };
}
