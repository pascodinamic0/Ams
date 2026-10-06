"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { isPublicRoute } from "@/lib/auth/public-routes";
import { notifyLiveRefresh } from "@/lib/live-sync";
import { createClient } from "@/lib/supabase/client";

/** Minimum gap between refreshes so a burst of writes becomes one render. */
const MIN_REFRESH_GAP_MS = 2_000;
/** Ignore a second realtime tick until a slow render has had time to finish. */
const REFRESH_SETTLE_MS = 20_000;
/** Collapse bursts of DB writes (attendance grid, bulk invoices) into one refresh. */
const REALTIME_DEBOUNCE_MS = 400;
/** Topic suffix so Strict Mode remounts never reuse a subscribed Realtime channel. */
let liveChannelSeq = 0;

/**
 * Refreshes the open screen when this school writes a sync tick or a notification.
 * Public pages (login, marketing) do not subscribe. There is no interval poll:
 * a full RSC refresh on a timer blocked the next click.
 */
export function AutoRefreshProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const lastRefreshAt = useRef(0);
  const inFlightUntil = useRef(0);
  const debounceTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isPublicRoute(pathname)) return;

    let liveNotifyTimer: number | undefined;

    const refreshNow = () => {
      const now = Date.now();
      if (now < inFlightUntil.current) return;
      if (now - lastRefreshAt.current < MIN_REFRESH_GAP_MS) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      lastRefreshAt.current = now;
      inFlightUntil.current = now + REFRESH_SETTLE_MS;
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

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    // Invalidates in-flight startLive() after unmount, sign-out, or a newer start.
    let liveGeneration = 0;

    function stopLive() {
      liveGeneration += 1;
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
    }

    async function startLive(userId: string) {
      stopLive();
      const generation = liveGeneration;
      if (cancelled) return;

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
      if (liveNotifyTimer !== undefined) {
        window.clearTimeout(liveNotifyTimer);
      }
      if (debounceTimer.current !== undefined) {
        window.clearTimeout(debounceTimer.current);
      }
      stopLive();
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
