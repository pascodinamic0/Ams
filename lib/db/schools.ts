import { createClient } from "@/lib/supabase/server";

export type SchoolRow = {
  id: string;
  name: string;
  slug: string;
  code: string;
  logo_url: string | null;
  cover_image_url: string | null;
  about: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  website_template: string | null;
  custom_domain: string | null;
  public_site_enabled: boolean | null;
  created_at: string;
  updated_at: string;
};

export type SchoolListItem = {
  id: string;
  name: string;
  region: string;
  status: string;
};

export async function getSchools(): Promise<SchoolListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schools")
    .select("id, name, address, public_site_enabled")
    .order("name");

  if (error) {
    console.error("getSchools error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return [];
  }

  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    region: s.address ?? "",
    status: s.public_site_enabled ? "Active" : "Inactive",
  }));
}

export async function getSchoolBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("slug", slug)
    .eq("public_site_enabled", true)
    .single();

  if (error || !data) return null;
  return data as SchoolRow;
}

export async function getSchoolById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as SchoolRow;
}
