import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  getSchoolAccessContext,
  schoolPortalBlocked,
} from "@/lib/auth/school-access";
import { canAccessPath, getDashboardForRole } from "@/lib/auth/rbac";

const PUBLIC_ROUTES = [
  "/",
  "/features",
  "/get-access",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/schools",
  "/contact",
  "/docs",
  "/privacy",
  "/terms",
  "/cookies",
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/schools/")) return true;
  return false;
}

/** Server Actions POST with this header; redirects break the RSC action response. */
function isServerAction(request: NextRequest): boolean {
  return request.headers.has("next-action");
}

export async function proxy(request: NextRequest) {
  const { response: supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const serverAction = isServerAction(request);

  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return supabaseResponse;
  }

  if (!user) {
    if (serverAction) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const access = await getSchoolAccessContext(request, user.id);
  const role = access?.role ?? null;

  if (role && !canAccessPath(role, pathname)) {
    if (serverAction) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = getDashboardForRole(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (access && schoolPortalBlocked(access, pathname)) {
    if (serverAction) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/pending";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (
    access?.schoolStatus === "approved" &&
    pathname === "/pending"
  ) {
    if (serverAction) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = getDashboardForRole(access.role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
