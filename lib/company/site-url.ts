import { getAppOrigin } from "@/lib/auth/app-url";

/** Canonical marketing site origin (www in production). */
export function getSiteOrigin(): string {
  return getAppOrigin();
}

export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}
