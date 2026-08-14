import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getApexCanonicalRedirectUrl } from "@/lib/auth/app-url";
import { getProxyAuthContext } from "@/lib/auth/proxy-context";
import {
  schoolHasProductAccess,
  schoolPortalBlockDestination,
  schoolPortalBlocked,
} from "@/lib/auth/school-access";
import { getPostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { isProfileOnboardingExempt } from "@/lib/auth/profile-onboarding";
import {
  isPasswordSetupPath,
  userMustSetPassword,
} from "@/lib/auth/password-setup";
import { isStructureSetupExempt } from "@/lib/auth/structure-setup";
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
  "/auth/confirm",
  "/auth/hash",
  "/forgot-password",
  "/reset-password",
  "/schools",
  "/contact",
  "/docs",
  "/blog",
  "/school-management-system",
  "/logiciel-de-gestion-scolaire",
  "/privacy",
  "/terms",
  "/cookies",
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/schools/")) return true;
  if (pathname.startsWith("/modules/")) return true;
  if (pathname.startsWith("/blog/")) return true;
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
  const canonicalRedirect = getApexCanonicalRedirectUrl(request);
  if (canonicalRedirect) {
    return NextResponse.redirect(canonicalRedirect, 308);
  }

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

  const isDevOnboardingPreview =
    process.env.NODE_ENV === "development" &&
    request.nextUrl.searchParams.get("preview") === "1" &&
    (pathname === "/onboarding" || pathname === "/onboarding/school");
  if (isDevOnboardingPreview) {
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

  if (
    (userMustSetPassword(user) || access?.passwordSetupRequired) &&
    !isPasswordSetupPath(pathname)
  ) {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(request, supabaseResponse, "/reset-password");
  }

  if (!isProfileOnboardingExempt(pathname) && access?.needsOnboarding) {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(request, supabaseResponse, "/onboarding");
  }

  if (access && schoolPortalBlocked(access, pathname)) {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(
      request,
      supabaseResponse,
      schoolPortalBlockDestination(access)
    );
  }

  if (pathname === "/onboarding" && access && !access.needsOnboarding) {
    if (serverAction) {
      return supabaseResponse;
    }
    if (!schoolHasProductAccess(access) && access.schoolStatus === "approved") {
      return redirectWithCookies(request, supabaseResponse, "/billing");
    }
    return redirectWithCookies(
      request,
      supabaseResponse,
      access.needsStructureSetup
        ? "/onboarding/school"
        : getDashboardForRole(access.role)
    );
  }

  if (
    access?.needsStructureSetup &&
    !access.needsOnboarding &&
    schoolHasProductAccess(access) &&
    !isStructureSetupExempt(pathname)
  ) {
    if (serverAction) {
      return supabaseResponse;
    }
    return redirectWithCookies(request, supabaseResponse, "/onboarding/school");
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

  if (access?.schoolStatus === "approved" && pathname === "/pending") {
    if (serverAction) {
      return supabaseResponse;
    }
    if (!schoolHasProductAccess(access)) {
      return redirectWithCookies(request, supabaseResponse, "/billing");
    }
    return redirectWithCookies(
      request,
      supabaseResponse,
      access.needsStructureSetup
        ? "/onboarding/school"
        : getDashboardForRole(access.role)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
