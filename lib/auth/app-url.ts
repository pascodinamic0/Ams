type AuthCallbackOptions = {
  intent?: "login" | "register";
  redirect?: string | null;
};

/** Canonical app origin for Supabase auth redirects (email confirm, password reset, OAuth). */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!fromEnv) {
    return "http://localhost:3000";
  }

  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) {
    return fromEnv.replace(/\/$/, "");
  }

  return `https://${fromEnv.replace(/\/$/, "")}`;
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
