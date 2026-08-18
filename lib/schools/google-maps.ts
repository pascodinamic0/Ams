const GOOGLE_MAP_HOSTS = new Set([
  "www.google.com",
  "google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
]);

const COORD_IN_AT = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
const COORD_PAIR = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;

export function isGoogleMapsShareUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (!GOOGLE_MAP_HOSTS.has(url.hostname)) return false;
    return (
      url.hostname.includes("maps") ||
      url.pathname.includes("/maps") ||
      url.searchParams.has("q") ||
      url.searchParams.has("daddr")
    );
  } catch {
    return false;
  }
}

export function googleMapsEmbedSrcFromParts(query: string, zoom = 16): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
}

function queryFromMapsUrl(url: URL): string | null {
  if (url.pathname.includes("/maps/embed") || url.searchParams.get("output") === "embed") {
    return url.toString();
  }

  const at = url.href.match(COORD_IN_AT);
  if (at) return `${at[1]},${at[2]}`;

  for (const key of ["q", "query", "daddr", "destination", "ll"]) {
    const value = url.searchParams.get(key)?.trim();
    if (!value) continue;
    if (key === "ll" && COORD_PAIR.test(value)) return value;
    if (value.startsWith("http")) continue;
    return value.replace(/\+/g, " ");
  }

  const place = url.pathname.match(/\/maps\/place\/([^/]+)/);
  if (place?.[1]) {
    try {
      return decodeURIComponent(place[1].replace(/\+/g, " "));
    } catch {
      return place[1].replace(/\+/g, " ");
    }
  }

  const search = url.pathname.match(/\/maps\/search\/([^/]+)/);
  if (search?.[1]) {
    try {
      return decodeURIComponent(search[1].replace(/\+/g, " "));
    } catch {
      return search[1].replace(/\+/g, " ");
    }
  }

  return null;
}

function toEmbedSrc(queryOrUrl: string): string {
  if (queryOrUrl.includes("output=embed") || queryOrUrl.includes("/maps/embed")) {
    return queryOrUrl;
  }
  return googleMapsEmbedSrcFromParts(queryOrUrl);
}

function extractIframeSrc(raw: string): string | null {
  const match = raw.match(/src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

export function googleMapsEmbedSrcFromInput(
  mapUrl?: string | null,
  address?: string | null
): string | null {
  const raw = mapUrl?.trim() || "";
  if (raw) {
    const iframeSrc = raw.includes("<iframe") ? extractIframeSrc(raw) : null;
    const candidate = iframeSrc ?? raw;
    try {
      const url = new URL(candidate);
      if (GOOGLE_MAP_HOSTS.has(url.hostname)) {
        const query = queryFromMapsUrl(url);
        if (query) return toEmbedSrc(query);
      }
    } catch {
      // Not a URL. Treat leftover text as a place name below.
    }
    if (!candidate.startsWith("http") && candidate.length > 3) {
      return googleMapsEmbedSrcFromParts(candidate);
    }
  }

  const fallback = address?.trim();
  if (fallback) return googleMapsEmbedSrcFromParts(fallback);
  return null;
}

export function googleMapsOpenUrl(
  mapUrl?: string | null,
  address?: string | null
): string | null {
  const raw = mapUrl?.trim();
  if (raw && isGoogleMapsShareUrl(raw)) return raw;
  if (raw && raw.startsWith("http")) return raw;
  const fallback = address?.trim();
  if (fallback) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallback)}`;
  }
  return null;
}

async function followGoogleMapsRedirect(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 ShuleOS-school-map" },
    });
    clearTimeout(timeout);
    return response.url || null;
  } catch {
    return null;
  }
}

export async function resolveGoogleMapsEmbedSrc(
  mapUrl?: string | null,
  address?: string | null
): Promise<string | null> {
  const immediate = googleMapsEmbedSrcFromInput(mapUrl, null);
  if (immediate) return immediate;

  const raw = mapUrl?.trim();
  if (raw && isGoogleMapsShareUrl(raw)) {
    const resolved = await followGoogleMapsRedirect(raw);
    if (resolved) {
      const fromRedirect = googleMapsEmbedSrcFromInput(resolved, null);
      if (fromRedirect) return fromRedirect;
    }
  }

  return googleMapsEmbedSrcFromInput(null, address);
}
