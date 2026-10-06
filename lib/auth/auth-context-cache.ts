import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { ProxyAuthContext } from "@/lib/auth/proxy-context";

const COOKIE = "ams_auth_ctx";
const FRESH_MS = 60_000;
const STALE_MS = 10 * 60_000;

type Entry = { at: number; value: ProxyAuthContext };

type CacheGlobal = typeof globalThis & {
  __amsAuthCache?: Map<string, Entry>;
  __amsAuthRefresh?: Set<string>;
};

function memory(): Map<string, Entry> {
  const g = globalThis as CacheGlobal;
  if (!g.__amsAuthCache) g.__amsAuthCache = new Map();
  return g.__amsAuthCache;
}

function refreshing(): Set<string> {
  const g = globalThis as CacheGlobal;
  if (!g.__amsAuthRefresh) g.__amsAuthRefresh = new Set();
  return g.__amsAuthRefresh;
}

function signingKey(): string | null {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    null
  );
}

function sign(body: string): string | null {
  const key = signingKey();
  if (!key) return null;
  return createHmac("sha256", key).update(body).digest("base64url");
}

export function readCachedAuth(userId: string): {
  value: ProxyAuthContext;
  fresh: boolean;
} | null {
  const entry = memory().get(userId);
  if (!entry) return null;
  const age = Date.now() - entry.at;
  if (age > STALE_MS) {
    memory().delete(userId);
    return null;
  }
  return { value: entry.value, fresh: age < FRESH_MS };
}

export function writeCachedAuth(userId: string, value: ProxyAuthContext) {
  memory().set(userId, { at: Date.now(), value });
}

export function beginAuthRefresh(userId: string): boolean {
  const set = refreshing();
  if (set.has(userId)) return false;
  set.add(userId);
  return true;
}

export function endAuthRefresh(userId: string) {
  refreshing().delete(userId);
}

export function readAuthCookie(
  request: NextRequest,
  userId: string
): ProxyAuthContext | null {
  const raw = request.cookies.get(COOKIE)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  const expected = sign(body);
  if (!expected || expected.length !== mac.length) return null;
  const valid = timingSafeEqual(Buffer.from(expected), Buffer.from(mac));
  if (!valid) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as { userId?: string; at?: number; value?: ProxyAuthContext };
    if (parsed.userId !== userId || !parsed.value || typeof parsed.at !== "number") {
      return null;
    }
    if (Date.now() - parsed.at > STALE_MS) return null;
    writeCachedAuth(userId, parsed.value);
    return parsed.value;
  } catch {
    return null;
  }
}

export function attachAuthCookie(response: NextResponse, userId: string, value: ProxyAuthContext) {
  const body = Buffer.from(
    JSON.stringify({ userId, at: Date.now(), value })
  ).toString("base64url");
  const mac = sign(body);
  if (!mac) return;
  response.cookies.set(COOKIE, `${body}.${mac}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(STALE_MS / 1000),
  });
}
