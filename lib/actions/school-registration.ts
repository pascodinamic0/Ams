"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_BRANCH_NAME,
  resolveUniqueSchoolCode,
  resolveUniqueSchoolSlug,
} from "@/lib/schools/identity";
import {
  DEFAULT_HERO_IMAGE,
  getDefaultWebsiteContent,
} from "@/lib/schools/website-content";

export type RegisterSchoolInput = {
  userId: string;
  schoolName: string;
  adminEmail: string;
  adminName?: string;
};

export async function registerSchoolOrganization(input: RegisterSchoolInput) {
  const admin = createAdminClient();
  if (!admin) {
    return { error: "Server configuration error. Contact support." };
  }

  const { userId, schoolName, adminEmail, adminName } = input;

  const { data: authUser, error: authUserError } =
    await admin.auth.admin.getUserById(userId);
  if (authUserError || !authUser.user) {
    return {
      error:
        "Account could not be verified. If you already have an account, sign in and complete school setup.",
    };
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("school_id, role")
    .eq("id", userId)
    .single();

  if (existingProfile?.school_id) {
    return { error: "This account is already linked to a school." };
  }

  const { data: ownedSchool } = await admin
    .from("schools")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (ownedSchool) {
    return { error: "You have already registered a school with this account." };
  }

  const slug = await resolveUniqueSchoolSlug(admin, schoolName);
  const code = await resolveUniqueSchoolCode(admin, schoolName);

  const { data: school, error: schoolError } = await admin
    .from("schools")
    .insert({
      name: schoolName,
      code,
      slug,
      contact_email: adminEmail,
      status: "pending",
      owner_id: userId,
      public_site_enabled: false,
      theme_primary_color: "#3b82f6",
      theme_secondary_color: "#1d4ed8",
      website_template: "modern",
      website_content: getDefaultWebsiteContent(schoolName),
      cover_image_url: DEFAULT_HERO_IMAGE,
      about: getDefaultWebsiteContent(schoolName).hero_subtitle,
    })
    .select("id, slug")
    .single();

  if (schoolError || !school) {
    console.error("registerSchoolOrganization school error:", schoolError);
    return { error: schoolError?.message ?? "Failed to create school" };
  }

  const { data: branch, error: branchError } = await admin
    .from("branches")
    .insert({
      school_id: school.id,
      name: DEFAULT_BRANCH_NAME,
      status: "active",
    })
    .select("id")
    .single();

  if (branchError || !branch) {
    console.error("registerSchoolOrganization branch error:", branchError);
    await admin.from("schools").delete().eq("id", school.id);
    return { error: branchError?.message ?? "Failed to create school campus" };
  }

  const displayName =
    adminName?.trim() || adminEmail.split("@")[0] || "School Admin";

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      name: displayName,
      role: "academic_admin",
      school_id: school.id,
      branch_id: branch.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("registerSchoolOrganization profile error:", profileError);
    await admin.from("branches").delete().eq("id", branch.id);
    await admin.from("schools").delete().eq("id", school.id);
    return { error: profileError.message };
  }

  return {
    data: {
      schoolId: school.id,
      branchId: branch.id,
      slug: school.slug,
      status: "pending" as const,
    },
  };
}
