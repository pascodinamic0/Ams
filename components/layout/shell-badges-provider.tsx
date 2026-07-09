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
import { fetchUnreadConversationCount } from "@/lib/actions/conversations";

const MESSAGING_ROLES = new Set(["super_admin", "academic_admin", "teacher", "parent"]);

type ShellBadgesContextValue = {
  unreadNotifications: number;
  unreadMessages: number;
  refresh: () => void;
};

const ShellBadgesContext = createContext<ShellBadgesContextValue>({
  unreadNotifications: 0,
  unreadMessages: 0,
  refresh: () => {},
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
    const interval = window.setInterval(() => void run(), 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [role, pathname]);

  const value = useMemo(
    () => ({
      unreadNotifications,
      unreadMessages,
      refresh: () => void load(),
    }),
    [unreadNotifications, unreadMessages, load]
  );

  return (
    <ShellBadgesContext.Provider value={value}>
      {children}
    </ShellBadgesContext.Provider>
  );
}
