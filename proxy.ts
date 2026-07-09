import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getProxyAuthContext } from "@/lib/auth/proxy-context";
import { schoolPortalBlocked } from "@/lib/auth/school-access";
import { getPostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { isProfileOnboardingExempt } from "@/lib/auth/profile-onboarding";
import { canAccessPath, getDashboardForRole } from "@/lib/auth/rbac";

const PUBLIC_ROUTES = [
  "/",
  "/features",
  "/get-access",
  "/login",
  "/register",
  "/register/complete",
  "/register/success",
  "/auth/callback",
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
  if (pathname.startsWith("/modules/")) return true;
  return false;
}

/** Server Actions POST with this header; redirects break the RSC action response. */
function isServerAction(request: NextRequest): boolean {
  return request.headers.has("next-action");
}

/** Preserve Supabase session cookies when middleware issues a redirect. */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options);
  });
}

function redirectWithCookies(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
  searchParams?: Record<string, string>
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  const redirectResponse = NextResponse.redirect(url);
  copyCookies(sessionResponse, redirectResponse);
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { response: supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const serverAction = isServerAction(request);

  if (isPublicRoute(pathname)) {
    if (pathname === "/login" && user && !serverAction) {
      const redirectParam = request.nextUrl.searchParams.get("redirect");
      const destination = await getPostAuthRedirect({
        userId: user.id,
        redirect: redirectParam,
      });
      return redirectWithCookies(request, supabaseResponse, destination);
    }
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
    return redirectWithCookies(request, supabaseResponse, "/login", {
      redirect: pathname,
    });
  }

  const access = await getProxyAuthContext(request, user);
  const role = access?.role ?? null;

  if (!isProfileOnboardingExempt(pathname) && access?.needsOnboarding) {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(request, supabaseResponse, "/onboarding");
  }

  if (pathname === "/onboarding" && access && !access.needsOnboarding) {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(
      request,
      supabaseResponse,
      getDashboardForRole(access.role)
    );
  }

  if (role && !canAccessPath(role, pathname)) {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(
      request,
      supabaseResponse,
      getDashboardForRole(role)
    );
  }

  if (access && schoolPortalBlocked(access, pathname)) {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(request, supabaseResponse, "/pending");
  }

  if (access?.schoolStatus === "approved" && pathname === "/pending") {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(
      request,
      supabaseResponse,
      getDashboardForRole(access.role)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
