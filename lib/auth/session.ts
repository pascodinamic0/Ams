import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AUTH_HEADERS, readEncodedHeader } from "@/lib/auth/request-auth";

export type CurrentProfile = {
  id: string;
  name: string | null;
  role: string;
  school_id: string | null;
  branch_id: string | null;
  email: string | null;
};

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const headerStore = await headers();
  const headerUserId = headerStore.get(AUTH_HEADERS.userId);
  if (headerUserId) {
    return {
      id: headerUserId,
      name: readEncodedHeader(headerStore.get(AUTH_HEADERS.name)),
      role: headerStore.get(AUTH_HEADERS.role) ?? "student",
      school_id: headerStore.get(AUTH_HEADERS.schoolId),
      branch_id: headerStore.get(AUTH_HEADERS.branchId),
      email: headerStore.get(AUTH_HEADERS.email),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    name: profile?.name ?? null,
    role: profile?.role ?? "student",
    school_id: profile?.school_id ?? null,
    branch_id: profile?.branch_id ?? null,
    email: user.email ?? null,
  };
});
