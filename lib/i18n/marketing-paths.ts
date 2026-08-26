/** Public school microsites use the school record locale, not the visitor cookie. */
export function isPublicSchoolSitePath(pathname: string): boolean {
  const match = pathname.match(/^\/schools\/([^/?#]+)/);
  const slug = match?.[1];
  return Boolean(slug && slug !== "templates");
}

/**
 * Marketing site and auth funnel paths where the visitor AMS_LOCALE cookie
 * wins over a logged-in user's school locale.
 */
export function isMarketingPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (isPublicSchoolSitePath(pathname)) return false;

  if (pathname === "/") return true;

  const prefixes = [
    "/features",
    "/offre",
    "/get-access",
    "/contact",
    "/docs",
    "/blog",
    "/school-management-system",
    "/logiciel-de-gestion-scolaire",
    "/privacy",
    "/terms",
    "/cookies",
    "/modules",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth",
    "/pending",
    "/onboarding",
    "/schools",
  ];

  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
