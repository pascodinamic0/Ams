type AuthCallbackOptions = {
  intent?: "login" | "register";
  redirect?: string | null;
};

function normalizeOrigin(value: string): string {
  const trimmed = value.trim().replace(/\/$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
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

export function buildAuthCallbackUrl(options?: AuthCallbackOptions): string {
  const url = new URL("/auth/callback", getAppOrigin());

  if (options?.intent === "register") {
    url.searchParams.set("intent", "register");
  }
  if (options?.redirect) {
    url.searchParams.set("redirect", options.redirect);
  }

  return url.toString();
}
