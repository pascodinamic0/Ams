import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import { normalizeRole, type UserRole } from "./rbac";

export async function getProfileRole(
  request: NextRequest,
  userId: string
): Promise<UserRole | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Read-only in middleware RBAC check
      },
    },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile?.role) return null;
  return normalizeRole(profile.role);
}
