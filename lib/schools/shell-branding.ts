import { cache } from "react";
import { headers } from "next/headers";
import { AUTH_HEADERS, readEncodedHeader } from "@/lib/auth/request-auth";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type SchoolShellBranding = {
  name: string;
  logoUrl: string | null;
};

export const getCurrentSchoolShellBranding = cache(
  async (): Promise<SchoolShellBranding | null> => {
    const headerStore = await headers();
    if (headerStore.get(AUTH_HEADERS.userId)) {
      const schoolId = headerStore.get(AUTH_HEADERS.schoolId);
      const name = readEncodedHeader(headerStore.get(AUTH_HEADERS.schoolName));
      if (!schoolId || !name) return null;
      return {
        name,
        logoUrl: readEncodedHeader(headerStore.get(AUTH_HEADERS.schoolLogo)),
      };
    }

    const profile = await getCurrentProfile();
    if (!profile?.school_id) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schools")
      .select("name, logo_url")
      .eq("id", profile.school_id)
      .single();

    if (error || !data) return null;

    return {
      name: data.name,
      logoUrl: data.logo_url,
    };
  }
);
