import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CURRENCY_CODE,
  getSchoolCurrency,
  type SchoolCurrency,
  type SchoolCurrencyCode,
} from "@/lib/currency";

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
  website_content: unknown;
  status: SchoolStatus;
  owner_id: string | null;
  currency_code: string;
  locale: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: import("@/lib/billing/types").SubscriptionStatus;
  subscription_price_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  billing_exempt: boolean;
  created_at: string;
  updated_at: string;
};

export type SchoolListItem = {
  id: string;
  name: string;
  slug: string;
  region: string;
  status: SchoolStatus;
  public_site_enabled: boolean;
  website_template: string | null;
  billing_exempt: boolean;
  subscription_status: import("@/lib/billing/types").SubscriptionStatus;
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
    .select(
      "id, name, slug, address, public_site_enabled, status, website_template, billing_exempt, subscription_status"
    )
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
    slug: s.slug,
    region: s.address ?? "",
    status: (s.status as SchoolStatus) ?? "pending",
    public_site_enabled: s.public_site_enabled ?? false,
    website_template: s.website_template ?? "modern",
    billing_exempt: Boolean(s.billing_exempt),
    subscription_status:
      (s.subscription_status as SchoolListItem["subscription_status"]) ?? "none",
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

export async function getSchoolCurrencyForSchool(
  schoolId: string | null | undefined
): Promise<SchoolCurrency> {
  if (!schoolId) {
    return getSchoolCurrency(DEFAULT_CURRENCY_CODE);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("schools")
    .select("currency_code")
    .eq("id", schoolId)
    .single();

  return getSchoolCurrency(data?.currency_code ?? DEFAULT_CURRENCY_CODE);
}

export async function getSchoolLocaleForSchool(
  schoolId: string | null | undefined
): Promise<string | null> {
  if (!schoolId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("schools")
    .select("locale")
    .eq("id", schoolId)
    .maybeSingle();

  return data?.locale ?? null;
}
