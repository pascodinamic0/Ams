import { createClient } from "@/lib/supabase/server";

export type SchoolStatus = "pending" | "approved" | "suspended";

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
  status: SchoolStatus;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SchoolListItem = {
  id: string;
  name: string;
  region: string;
  status: SchoolStatus;
  public_site_enabled: boolean;
};

export type SchoolDirectoryItem = {
  slug: string;
  name: string;
  about: string | null;
  logo_url: string | null;
};

export async function getSchools(): Promise<SchoolListItem[]>;
export async function getSchools(options: {
  publicOnly: true;
}): Promise<SchoolDirectoryItem[]>;
export async function getSchools(options?: {
  publicOnly?: boolean;
}): Promise<SchoolListItem[] | SchoolDirectoryItem[]> {
  const supabase = await createClient();

  if (options?.publicOnly) {
    const { data, error } = await supabase
      .from("schools")
      .select("slug, name, about, logo_url")
      .eq("public_site_enabled", true)
      .order("name");

    if (error) {
      console.error(
        "getSchools error:",
        error.message,
        error.code ?? "",
        error.hint ?? ""
      );
      return [];
    }

    return (data ?? []) as SchoolDirectoryItem[];
  }

  const { data, error } = await supabase
    .from("schools")
    .select("id, name, address, public_site_enabled, status")
    .order("name");

  if (error) {
    console.error(
      "getSchools error:",
      error.message,
      error.code ?? "",
      error.hint ?? ""
    );
    return [];
  }

  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    region: s.address ?? "",
    status: (s.status as SchoolStatus) ?? "pending",
    public_site_enabled: s.public_site_enabled ?? false,
  }));
}

export async function getSchoolStatusForUser(
  userId: string
): Promise<{ schoolId: string; status: SchoolStatus; name: string } | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", userId)
    .single();

  if (!profile?.school_id) return null;

  const { data: school } = await supabase
    .from("schools")
    .select("id, name, status")
    .eq("id", profile.school_id)
    .single();

  if (!school) return null;

  return {
    schoolId: school.id,
    status: (school.status as SchoolStatus) ?? "pending",
    name: school.name,
  };
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
