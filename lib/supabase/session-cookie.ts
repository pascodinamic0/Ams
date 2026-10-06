import type { User } from "@supabase/supabase-js";

/** Refresh with Auth only when the access token is inside this window. */
const REFRESH_WINDOW_MS = 60_000;
const BASE64_PREFIX = "base64-";

export type CookieSession =
  | { status: "anonymous" }
  | { status: "refresh" }
  | { status: "fresh"; user: User };

type AccessClaims = {
  sub?: string;
  exp?: number;
  email?: string;
  aud?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

function authCookieName(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) return null;
  return `sb-${ref}-auth-token`;
}

function decodeCookieValue(value: string): string {
  if (!value.startsWith(BASE64_PREFIX)) return value;
  return Buffer.from(value.slice(BASE64_PREFIX.length), "base64url").toString(
    "utf8"
  );
}

function readAuthCookie(
  cookies: { name: string; value: string }[],
  key: string
): string | null {
  const direct = cookies.find((cookie) => cookie.name === key)?.value;
  if (direct) return decodeCookieValue(direct);

  const parts: string[] = [];
  for (let index = 0; ; index += 1) {
    const part = cookies.find((cookie) => cookie.name === `${key}.${index}`)?.value;
    if (!part) break;
    parts.push(part);
  }
  if (parts.length === 0) return null;
  return decodeCookieValue(parts.join(""));
}

function decodeAccessToken(token: string): AccessClaims | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AccessClaims;
  } catch {
    return null;
  }
}

/**
 * Read the Supabase session from request cookies.
 * Anonymous visitors skip the Auth server. A still-valid access token is
 * trusted until it is close to expiry.
 */
export function readCookieSession(
  cookies: { name: string; value: string }[]
): CookieSession {
  const key = authCookieName();
  if (!key) return { status: "refresh" };

  const raw = readAuthCookie(cookies, key);
  if (!raw) return { status: "anonymous" };

  let accessToken: string | undefined;
  try {
    const session = JSON.parse(raw) as { access_token?: string };
    accessToken = session.access_token;
  } catch {
    return { status: "refresh" };
  }
  if (!accessToken) return { status: "refresh" };

  const claims = decodeAccessToken(accessToken);
  if (!claims?.sub || typeof claims.exp !== "number") return { status: "refresh" };
  if (claims.exp * 1000 <= Date.now() + REFRESH_WINDOW_MS) {
    return { status: "refresh" };
  }

  return {
    status: "fresh",
    user: {
      id: claims.sub,
      aud: claims.aud ?? "authenticated",
      role: "authenticated",
      email: claims.email,
      app_metadata: claims.app_metadata ?? {},
      user_metadata: claims.user_metadata ?? {},
      created_at: new Date(0).toISOString(),
    } as User,
  };
}
