"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { notifyLiveRefresh } from "@/lib/live-sync";
import { createClient } from "@/lib/supabase/client";

/** Minimum gap between refreshes to avoid double-firing on focus+visibility+realtime. */
const MIN_REFRESH_GAP_MS = 2_000;
/** Collapse bursts of DB writes (attendance grid, bulk invoices) into one refresh. */
const REALTIME_DEBOUNCE_MS = 400;
/**
 * Safety-net poll while the tab is visible.
 * Realtime covers most cross-account writes; this catches anything the tick missed.
 * ~8s is typical for operational dashboards (Jira/ServiceNow-class list freshness).
 */
const POLL_INTERVAL_MS = 8_000;
/** Topic suffix so Strict Mode remounts never reuse a subscribed Realtime channel. */
let liveChannelSeq = 0;

/**
 * Keeps App Router server data fresh without a manual browser reload.
 * Mount once near the root so every authenticated (and public) screen benefits.
 */
export function AutoRefreshProvider() {
  const router = useRouter();
  const lastRefreshAt = useRef(0);
  const debounceTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let liveNotifyTimer: number | undefined;

    const refreshNow = () => {
      const now = Date.now();
      if (now - lastRefreshAt.current < MIN_REFRESH_GAP_MS) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      lastRefreshAt.current = now;
      router.refresh();
      // Let the RSC refresh start first so it does not abort badge Server Actions.
      if (liveNotifyTimer !== undefined) window.clearTimeout(liveNotifyTimer);
      liveNotifyTimer = window.setTimeout(() => notifyLiveRefresh(), 400);
    };

    const refreshSoon = () => {
      if (debounceTimer.current !== undefined) {
        window.clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = window.setTimeout(refreshNow, REALTIME_DEBOUNCE_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshNow();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refreshNow);
    window.addEventListener("online", refreshNow);

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let interval: number | undefined;
    let cancelled = false;
    // Invalidates in-flight startLive() after unmount, sign-out, or a newer start.
    let liveGeneration = 0;

    function stopLive() {
      liveGeneration += 1;
      if (interval !== undefined) {
        window.clearInterval(interval);
        interval = undefined;
      }
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
    }

    async function startLive(userId: string) {
      stopLive();
      const generation = liveGeneration;
      if (cancelled) return;

      interval = window.setInterval(() => {
        if (document.visibilityState === "visible") refreshNow();
      }, POLL_INTERVAL_MS);

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id, role")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled || generation !== liveGeneration) return;

      const schoolId = profile?.school_id as string | null | undefined;
      const isSuperAdmin = profile?.role === "super_admin";
      // Unique topic: supabase.channel(name) returns an existing subscribed channel.
      const live = supabase.channel(`school-live:${userId}:${++liveChannelSeq}`);

      if (schoolId) {
        live.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "school_sync_ticks",
            filter: `school_id=eq.${schoolId}`,
          },
          refreshSoon
        );
      } else if (isSuperAdmin) {
        live.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "school_sync_ticks",
          },
          refreshSoon
        );
      }

      live.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        refreshSoon
      );

      if (cancelled || generation !== liveGeneration) {
        void supabase.removeChannel(live);
        return;
      }

      channel = live.subscribe();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        stopLive();
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void startLive(session.user.id);
      }
    });

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refreshNow);
      window.removeEventListener("online", refreshNow);
      if (liveNotifyTimer !== undefined) {
        window.clearTimeout(liveNotifyTimer);
      }
      if (debounceTimer.current !== undefined) {
        window.clearTimeout(debounceTimer.current);
      }
      stopLive();
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
