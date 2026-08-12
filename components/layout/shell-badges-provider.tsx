"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { fetchUnreadNotificationCount } from "@/app/notifications/actions";
import { NotificationToasts } from "@/components/layout/notification-toasts";
import { fetchUnreadConversationCount } from "@/lib/actions/conversations";
import { MESSAGING_STAFF_ROLES } from "@/lib/auth/rbac";
import { LIVE_REFRESH_EVENT } from "@/lib/live-sync";

const MESSAGING_ROLES = new Set([...MESSAGING_STAFF_ROLES, "parent"]);

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

  const load = useCallback(async () => {
    const [notifications, messages] = await Promise.all([
      fetchUnreadNotificationCount(),
      MESSAGING_ROLES.has(role)
        ? fetchUnreadConversationCount()
        : Promise.resolve(0),
    ]);

    setUnreadNotifications(notifications);
    setUnreadMessages(messages);
  }, [role]);

  useEffect(() => {
    let active = true;

    async function run() {
      const [notifications, messages] = await Promise.all([
        fetchUnreadNotificationCount(),
        MESSAGING_ROLES.has(role)
          ? fetchUnreadConversationCount()
          : Promise.resolve(0),
      ]);

      if (!active) return;
      setUnreadNotifications(notifications);
      setUnreadMessages(messages);
    }

    void run();
    const interval = window.setInterval(() => void run(), 15_000);

    const onLiveRefresh = () => {
      void run();
    };
    window.addEventListener(LIVE_REFRESH_EVENT, onLiveRefresh);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener(LIVE_REFRESH_EVENT, onLiveRefresh);
    };
  }, [role, pathname]);

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
