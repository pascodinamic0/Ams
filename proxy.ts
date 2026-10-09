import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getApexCanonicalRedirectUrl } from "@/lib/auth/app-url";
import {
  getProxyAuthContext,
  type ProxyAuthContext,
} from "@/lib/auth/proxy-context";
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
import { isPublicRoute } from "@/lib/auth/public-routes";
import {
  disabledFeatureForPath,
  featureBlockDestination,
} from "@/lib/features/access";
import { requiredFeatureKeys } from "@/lib/features/catalog";
import { attachAuthCookie } from "@/lib/auth/auth-context-cache";
import {
  clearAuthHeaders,
  writeAuthHeaders,
} from "@/lib/auth/request-auth";
import type { User } from "@supabase/supabase-js";

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

/** Forward the request with proxy auth attached, and drop any client-supplied copy. */
function passThrough(
  request: NextRequest,
  sessionResponse: NextResponse,
  user: User | null,
  access: ProxyAuthContext | null
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  clearAuthHeaders(requestHeaders);
  if (user && access) {
    writeAuthHeaders(requestHeaders, {
      userId: user.id,
      email: user.email ?? access.email,
      role: access.role,
      name: access.name,
      schoolId: access.schoolId,
      branchId: access.branchId,
      schoolName: access.schoolName,
      schoolLogoUrl: access.schoolLogoUrl,
    });
  }
  const next = NextResponse.next({ request: { headers: requestHeaders } });
  copyCookies(sessionResponse, next);
  if (user && access) attachAuthCookie(next, user.id, access);
  return next;
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
        user,
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
      redirect:
        pathname === "/finance/outstanding" ||
        pathname.startsWith("/finance/outstanding/")
          ? "/finance/invoices"
          : pathname,
    });
  }

  if (
    !serverAction &&
    (pathname === "/finance/outstanding" ||
      pathname.startsWith("/finance/outstanding/"))
  ) {
    return redirectWithCookies(request, supabaseResponse, "/finance/invoices");
  }

  const access = await getProxyAuthContext(request, user);
  const role = access?.role ?? null;

  if (
    (userMustSetPassword(user) || access?.passwordSetupRequired) &&
    !isPasswordSetupPath(pathname)
  ) {
    if (serverAction) {
      return passThrough(request, supabaseResponse, user, access);
    }
    return redirectWithCookies(request, supabaseResponse, "/reset-password");
  }

  if (!isProfileOnboardingExempt(pathname) && access?.needsOnboarding) {
    if (serverAction) {
      return passThrough(request, supabaseResponse, user, access);
    }
    return redirectWithCookies(request, supabaseResponse, "/onboarding");
  }

  if (access && schoolPortalBlocked(access, pathname)) {
    if (serverAction) {
      return passThrough(request, supabaseResponse, user, access);
    }
    return redirectWithCookies(
      request,
      supabaseResponse,
      schoolPortalBlockDestination(access)
    );
  }

  if (pathname === "/onboarding" && access && !access.needsOnboarding) {
    if (serverAction) {
      return passThrough(request, supabaseResponse, user, access);
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
      return passThrough(request, supabaseResponse, user, access);
    }
    return redirectWithCookies(request, supabaseResponse, "/onboarding/school");
  }

  if (role && !canAccessPath(role, pathname)) {
    if (serverAction) {
      return passThrough(request, supabaseResponse, user, access);
    }
    return redirectWithCookies(
      request,
      supabaseResponse,
      getDashboardForRole(role)
    );
  }

  if (
    access?.schoolId &&
    access.role !== "super_admin" &&
    requiredFeatureKeys(pathname).length > 0
  ) {
    const blocked = await Promise.race([
      disabledFeatureForPath(access.schoolId, pathname),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 800)),
    ]);
    if (blocked) {
      if (serverAction) {
        return new NextResponse("Feature disabled", { status: 403 });
      }
      const destination = featureBlockDestination(access.role, blocked);
      if (destination !== pathname) {
        return redirectWithCookies(request, supabaseResponse, destination, {
          module: blocked,
        });
      }
    }
  }

  if (access?.schoolStatus === "approved" && pathname === "/pending") {
    if (serverAction) {
      return passThrough(request, supabaseResponse, user, access);
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

  return passThrough(request, supabaseResponse, user, access);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
