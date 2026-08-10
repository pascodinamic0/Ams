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

/** Public marketing site. */
const MARKETING_NAMESPACES = ["marketing", "modules", "blog", "schools"] as const;

/**
 * App namespaces for authenticated areas. Sent together with marketing so
 * client navigations between public and dashboard routes keep working without
 * remounting the root layout.
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

function pickNamespaces(messages: Messages, namespaces: Iterable<string>): Messages {
  const picked: Messages = {};
  for (const ns of namespaces) {
    if (ns in messages) {
      picked[ns] = messages[ns];
    }
  }
  return picked;
}

/**
 * Trim next-intl client hydration payload to namespaces the client may need.
 * Pathname is accepted for API stability; soft navigations do not remount the
 * root layout, so route-scoped trimming would drop namespaces after client
 * transitions (e.g. login → /admin/schools/new missing `admin`).
 */
export function pickClientMessages(messages: Messages, _pathname: string): Messages {
  return pickNamespaces(messages, [
    ...CORE_NAMESPACES,
    ...MARKETING_NAMESPACES,
    ...APP_NAMESPACES,
  ]);
}
