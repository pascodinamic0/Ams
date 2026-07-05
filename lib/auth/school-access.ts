import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import { normalizeRole, type UserRole } from "./rbac";

export type SchoolAccessContext = {
  role: UserRole;
  schoolId: string | null;
  schoolStatus: "pending" | "approved" | "suspended" | null;
};

export async function getSchoolAccessContext(
  request: NextRequest,
  userId: string
): Promise<SchoolAccessContext | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", userId)
    .single();

  if (!profile?.role) return null;

  const role = normalizeRole(profile.role);
  let schoolStatus: SchoolAccessContext["schoolStatus"] = null;

  if (profile.school_id) {
    const { data: school } = await supabase
      .from("schools")
      .select("status")
      .eq("id", profile.school_id)
      .single();
    schoolStatus = (school?.status as SchoolAccessContext["schoolStatus"]) ?? null;
  }

  return {
    role,
    schoolId: profile.school_id,
    schoolStatus,
  };
}

export function schoolPortalBlocked(
  ctx: SchoolAccessContext,
  pathname: string
): boolean {
  if (ctx.role === "super_admin") return false;
  if (!ctx.schoolId || !ctx.schoolStatus) return false;
  if (ctx.schoolStatus === "approved") return false;

  const allowed =
    pathname === "/pending" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/settings") ||
    pathname === "/login";

  return !allowed;
}
