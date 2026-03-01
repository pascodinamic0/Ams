"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateSchoolInput = {
  name: string;
  adminEmail?: string;
  customDomain?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  websiteTemplate?: "modern" | "classic" | "minimal";
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateCode(name: string): string {
  const slug = slugify(name);
  const parts = slug.split("-").filter(Boolean);
  if (parts.length >= 2) {
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }
  return (slug.slice(0, 3) || "SCH").toUpperCase();
}

export async function createSchool(input: CreateSchoolInput) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from("schools")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const code = generateCode(input.name);

  const { data, error } = await supabase
    .from("schools")
    .insert({
      name: input.name,
      code,
      slug,
      custom_domain: input.customDomain || null,
      theme_primary_color: input.themePrimaryColor ?? "#3b82f6",
      theme_secondary_color: input.themeSecondaryColor ?? "#1d4ed8",
      website_template: input.websiteTemplate ?? "modern",
      public_site_enabled: true,
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("createSchool error:", error);
    return { error: error.message };
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
  }>
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("schools").update(updates).eq("id", id);

  if (error) {
    console.error("updateSchool error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/schools");
  revalidatePath(`/admin/schools/${id}`);
  return {};
}

export async function deleteSchool(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("schools").delete().eq("id", id);

  if (error) {
    console.error("deleteSchool error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/schools");
  return {};
}
