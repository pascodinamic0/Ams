"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { fetchUnreadNotificationCount } from "@/app/notifications/actions";

interface NotificationBellProps {
  className?: string;
  showLabel?: boolean;
}

export function NotificationBell({ className = "", showLabel = false }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  useEffect(() => {
    let active = true;

    async function load() {
      const count = await fetchUnreadNotificationCount();
      if (active) setUnreadCount(count);
    }

    load();
    const interval = setInterval(load, 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className={`relative rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 ${className}`}
      aria-label={unreadCount > 0 ? tc("unreadNotifications", { count: unreadCount }) : t("notifications")}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
      {showLabel && <span className="text-xs">{t("alerts")}</span>}
    </Link>
  );
}
