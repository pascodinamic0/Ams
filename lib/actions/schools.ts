"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_BRANCH_NAME,
  resolveUniqueSchoolCode,
  resolveUniqueSchoolSlug,
} from "@/lib/schools/identity";
import {
  getEmptyWebsiteContent,
  type SchoolWebsiteContent,
} from "@/lib/schools/website-content";

export type CreateSchoolInput = {
  name: string;
  adminEmail?: string;
  customDomain?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  websiteTemplate?: "modern" | "classic" | "minimal";
};

export async function createSchool(input: CreateSchoolInput) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { error: "Only platform administrators can add schools from the admin panel" };
  }

  const admin = createAdminClient();
  if (!admin) return { error: "Server configuration error" };

  const slug = await resolveUniqueSchoolSlug(admin, input.name);
  const code = await resolveUniqueSchoolCode(admin, input.name);

  const websiteContent = getEmptyWebsiteContent(input.name);

  const { data, error } = await admin
    .from("schools")
    .insert({
      name: input.name,
      code,
      slug,
      contact_email: input.adminEmail || null,
      custom_domain: input.customDomain || null,
      theme_primary_color: input.themePrimaryColor ?? "#3b82f6",
      theme_secondary_color: input.themeSecondaryColor ?? "#1d4ed8",
      website_template: input.websiteTemplate ?? "modern",
      website_content: websiteContent,
      cover_image_url: null,
      about: null,
      status: "approved",
      public_site_enabled: false,
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("createSchool error:", error);
    return { error: error.message };
  }

  const { error: branchError } = await admin.from("branches").insert({
    school_id: data.id,
    name: DEFAULT_BRANCH_NAME,
    status: "active",
  });

  if (branchError) {
    console.error("createSchool branch error:", branchError);
    await admin.from("schools").delete().eq("id", data.id);
    return { error: branchError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/schools");
  return { data: { id: data.id, slug: data.slug } };
}

export async function updateSchool(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    logo_url: string;
    cover_image_url: string;
    about: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    theme_primary_color: string;
    theme_secondary_color: string;
    website_template: "modern" | "classic" | "minimal";
    custom_domain: string;
    public_site_enabled: boolean;
    website_content: SchoolWebsiteContent;
  }>
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role === "academic_admin") {
    if (profile.school_id !== id) {
      return { error: "You can only edit your own school's website" };
    }
  } else if (profile?.role !== "super_admin") {
    return { error: "Not authorized to update school website" };
  }

  if (updates.slug) {
    const { data: existing } = await supabase
      .from("schools")
      .select("id")
      .eq("slug", updates.slug)
      .neq("id", id)
      .maybeSingle();
    if (existing) {
      return { error: "Slug already in use" };
    }
  }

  const { data: school, error } = await supabase
    .from("schools")
    .update(updates)
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    console.error("updateSchool error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/schools");
  revalidatePath("/admin/websites");
  revalidatePath(`/admin/websites/${id}`);
  revalidatePath(`/admin/schools/${id}`);
  revalidatePath("/academic/website");
  revalidatePath("/schools");
  if (school?.slug) {
    revalidatePath(`/schools/${school.slug}`);
    revalidatePath(`/schools/${school.slug}/admissions`);
  }
  return {};
}

export async function deleteSchool(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { error: "Only platform administrators can delete schools" };
  }

  const admin = createAdminClient();
  if (!admin) return { error: "Server configuration error" };

  const { error } = await admin.from("schools").delete().eq("id", id);

  if (error) {
    console.error("deleteSchool error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/schools");
  revalidatePath("/schools");
  return {};
}
