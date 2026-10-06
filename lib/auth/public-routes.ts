const PUBLIC_ROUTES = [
  "/",
  "/features",
  "/offre",
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

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/schools/")) return true;
  if (pathname.startsWith("/modules/")) return true;
  if (pathname.startsWith("/blog/")) return true;
  return false;
}
