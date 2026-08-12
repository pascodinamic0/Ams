"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** Minimum gap between refreshes to avoid double-firing on focus+visibility. */
const MIN_REFRESH_GAP_MS = 2_000;
/** Soft-poll while the tab is visible so lists and dashboards stay current. */
const POLL_INTERVAL_MS = 30_000;

/**
 * Keeps App Router server data fresh without a manual browser reload.
 * Mount once near the root so every authenticated (and public) screen benefits.
 */
export function AutoRefreshProvider() {
  const router = useRouter();
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      if (now - lastRefreshAt.current < MIN_REFRESH_GAP_MS) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      lastRefreshAt.current = now;
      router.refresh();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    const onFocus = () => refresh();
    const onOnline = () => refresh();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      window.clearInterval(interval);
    };
  }, [router]);

  return null;
}
