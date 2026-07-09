type Messages = Record<string, unknown>;

/** Always needed by shared chrome (shell, toasts, auth widgets, PWA). */
const CORE_NAMESPACES = [
  "common",
  "nav",
  "pwa",
  "settings",
  "validation",
  "errors",
  "roles",
  "messages",
  "onboarding",
  "auth",
  "notifications",
] as const;

/** Public marketing site — always hydrated (soft nav keeps the first payload). */
const MARKETING_NAMESPACES = ["marketing", "modules", "schools"] as const;

/**
 * App namespaces for authenticated areas. Sent together so client navigations
 * between dashboards keep working without remounting the root layout.
 */
const APP_NAMESPACES = [
  "admin",
  "academic",
  "finance",
  "operations",
  "teacher",
  "parent",
  "student",
  "analytics",
  "outreach",
] as const;

const MARKETING_PREFIXES = [
  "/",
  "/features",
  "/get-access",
  "/schools",
  "/contact",
  "/docs",
  "/privacy",
  "/terms",
  "/cookies",
  "/modules",
];

function isMarketingPath(pathname: string): boolean {
  if (MARKETING_PREFIXES.includes(pathname)) return true;
  if (pathname.startsWith("/schools/")) return true;
  if (pathname.startsWith("/modules/")) return true;
  return false;
}

function isAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/register/") ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth/")
  );
}

function pickNamespaces(messages: Messages, namespaces: Iterable<string>): Messages {
  const picked: Messages = {};
  for (const ns of namespaces) {
    if (ns in messages) {
      picked[ns] = messages[ns];
    }
  }
  return picked;
}

/** Trim next-intl client hydration payload to namespaces needed for the route. */
export function pickClientMessages(messages: Messages, pathname: string): Messages {
  // Always include marketing namespaces. The root layout does not remount on
  // soft navigations, so the first payload must still resolve public-site keys
  // after auth → / (or app → /) client transitions.
  const namespaces = new Set<string>([...CORE_NAMESPACES, ...MARKETING_NAMESPACES]);

  if (isMarketingPath(pathname) || isAuthPath(pathname)) {
    // Marketing/auth don't need role dashboards.
    return pickNamespaces(messages, namespaces);
  }

  for (const ns of APP_NAMESPACES) namespaces.add(ns);
  return pickNamespaces(messages, namespaces);
}
