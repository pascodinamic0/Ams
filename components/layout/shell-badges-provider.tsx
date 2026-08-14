"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { fetchUnreadNotificationCount } from "@/app/notifications/actions";
import { NotificationToasts } from "@/components/layout/notification-toasts";
import { fetchUnreadConversationCount } from "@/lib/actions/conversations";
import { MESSAGING_STAFF_ROLES } from "@/lib/auth/rbac";
import { LIVE_REFRESH_EVENT } from "@/lib/live-sync";

const MESSAGING_ROLES = new Set([...MESSAGING_STAFF_ROLES, "parent"]);

/** Refresh/HMR/offline abort in-flight Server Actions as a TypeError overlay. */
function isIgnorableBadgeError(error: unknown): boolean {
  if (!(error instanceof Error)) return true;
  const message = error.message.toLowerCase();
  return (
    error.name === "AbortError" ||
    error.name === "TypeError" ||
    message.includes("failed to fetch") ||
    message.includes("abort")
  );
}

async function fetchBadgeCounts(role: string): Promise<{
  notifications: number;
  messages: number;
} | null> {
  try {
    const [notifications, messages] = await Promise.all([
      fetchUnreadNotificationCount(),
      MESSAGING_ROLES.has(role)
        ? fetchUnreadConversationCount()
        : Promise.resolve(0),
    ]);
    return { notifications, messages };
  } catch (error) {
    if (!isIgnorableBadgeError(error)) {
      console.error("Failed to refresh shell badges:", error);
    }
    return null;
  }
}

type ShellBadgesContextValue = {
  unreadNotifications: number;
  unreadMessages: number;
  refresh: () => void;
  /** Instant badge bump when a realtime notification arrives. */
  bumpUnreadNotifications: (by?: number) => void;
};

const ShellBadgesContext = createContext<ShellBadgesContextValue>({
  unreadNotifications: 0,
  unreadMessages: 0,
  refresh: () => {},
  bumpUnreadNotifications: () => {},
});

export function useShellBadges() {
  return useContext(ShellBadgesContext);
}

export function ShellBadgesProvider({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const inFlight = useRef(false);

  const applyCounts = useCallback(
    async (active?: { current: boolean }) => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const counts = await fetchBadgeCounts(role);
        if (!counts || active?.current === false) return;
        setUnreadNotifications(counts.notifications);
        setUnreadMessages(counts.messages);
      } finally {
        inFlight.current = false;
      }
    },
    [role]
  );

  const load = useCallback(async () => {
    await applyCounts();
  }, [applyCounts]);

  useEffect(() => {
    const active = { current: true };

    void applyCounts(active);
    const interval = window.setInterval(() => void applyCounts(active), 15_000);

    const onLiveRefresh = () => {
      void applyCounts(active);
    };
    window.addEventListener(LIVE_REFRESH_EVENT, onLiveRefresh);

    return () => {
      active.current = false;
      window.clearInterval(interval);
      window.removeEventListener(LIVE_REFRESH_EVENT, onLiveRefresh);
    };
  }, [applyCounts, pathname]);

  const refresh = useCallback(() => {
    void load();
  }, [load]);

  const bumpUnreadNotifications = useCallback((by = 1) => {
    setUnreadNotifications((count) => count + by);
  }, []);

  const value = useMemo(
    () => ({
      unreadNotifications,
      unreadMessages,
      refresh,
      bumpUnreadNotifications,
    }),
    [unreadNotifications, unreadMessages, refresh, bumpUnreadNotifications]
  );

  return (
    <ShellBadgesContext.Provider value={value}>
      <NotificationToasts />
      {children}
    </ShellBadgesContext.Provider>
  );
}
