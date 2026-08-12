type AuthCallbackOptions = {
  intent?: "login" | "register" | "invite";
  redirect?: string | null;
};

export function normalizeOrigin(value: string): string {
  const trimmed = value.trim().replace(/\/$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function hostFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-host");
  const host = (forwarded ?? headers.get("host") ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  return host.replace(/:\d+$/, "");
}

/**
 * Canonical app origin for Supabase auth redirects (email confirm, password reset, OAuth).
 * Prefer NEXT_PUBLIC_APP_URL so apex vs www never drifts from the allowlisted callback host.
 */
export function getAppOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (fromEnv) {
    return normalizeOrigin(fromEnv);
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeOrigin(vercelUrl);
  }

  return "http://localhost:3000";
}

/**
 * Origin for post-auth redirects. Production always uses the canonical www host
 * so session cookies are never set on apex while the user lands on www (or vice versa).
 * Preview deployments stay on the preview host so invite links can be tested.
 */
export function getAuthRedirectOrigin(request: Request): string {
  if (process.env.NODE_ENV === "development") {
    return new URL(request.url).origin;
  }

  if (process.env.VERCEL_ENV === "production") {
    return getAppOrigin();
  }

  const host = hostFromHeaders(request.headers);
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

/**
 * If production traffic hit the apex (shuleos.app) while the canonical host is www,
 * return the www URL to 308-redirect to. Otherwise null.
 */
export function getApexCanonicalRedirectUrl(request: Request): URL | null {
  if (process.env.VERCEL_ENV !== "production") {
    return null;
  }

  let canonicalHost: string;
  try {
    canonicalHost = new URL(getAppOrigin()).host.toLowerCase();
  } catch {
    return null;
  }

  const requestHost = hostFromHeaders(request.headers);
  if (!requestHost || requestHost === canonicalHost) {
    return null;
  }

  const apexOfCanonical = canonicalHost.replace(/^www\./, "");
  if (requestHost !== apexOfCanonical) {
    return null;
  }

  const dest = new URL(request.url);
  dest.protocol = "https:";
  dest.host = canonicalHost;
  dest.port = "";
  return dest;
}

/** Origin used when generating invite / reset links from a server action. */
export async function getServerRequestOrigin(): Promise<string> {
  if (process.env.VERCEL_ENV === "production") {
    return getAppOrigin();
  }

  if (process.env.NODE_ENV === "development") {
    return getAppOrigin();
  }

  const { headers } = await import("next/headers");
  const headerStore = await headers();
  const host = hostFromHeaders(headerStore);
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host}`;
  }

  return getAppOrigin();
}

export function buildAuthCallbackUrl(options?: AuthCallbackOptions): string {
  const url = new URL("/auth/callback", getAppOrigin());

  if (options?.intent === "register" || options?.intent === "invite") {
    url.searchParams.set("intent", options.intent);
  }
  if (options?.redirect) {
    url.searchParams.set("redirect", options.redirect);
  }

  return url.toString();
}

export function buildPasswordSetupUrl(options: {
  origin: string;
  tokenHash: string;
  type: "invite" | "recovery";
}): string {
  const url = new URL("/auth/confirm", options.origin);
  url.searchParams.set("token_hash", options.tokenHash);
  url.searchParams.set("type", options.type);
  url.searchParams.set("next", "/reset-password");
  return url.toString();
}
