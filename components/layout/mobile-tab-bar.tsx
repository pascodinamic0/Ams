"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { fetchUnreadConversationCount } from "@/lib/actions/conversations";
import { getMobileTabs, isTabActive } from "@/lib/layout/mobile-nav";
import { cn } from "@/lib/utils";

const MESSAGING_ROLES = new Set(["super_admin", "academic_admin", "teacher", "parent"]);

interface MobileTabBarProps {
  role: string;
  onMenuOpen: () => void;
}

export function MobileTabBar({ role, onMenuOpen }: MobileTabBarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tabs = getMobileTabs(role);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!MESSAGING_ROLES.has(role)) return;

    let active = true;

    async function load() {
      const count = await fetchUnreadConversationCount();
      if (active) setUnreadMessages(count);
    }

    load();
    const interval = setInterval(load, 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [role, pathname]);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-xl md:hidden dark:border-stone-800 dark:bg-stone-900/95"
      aria-label={tCommon("menu")}
    >
      <div className="flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const Icon = tab.icon;
          const showBadge = tab.href === "/messages" && unreadMessages > 0;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary dark:text-primary"
                  : "text-stone-500 dark:text-stone-400"
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </span>
              <span className="truncate">{t(tab.labelKey as Parameters<typeof t>[0])}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMenuOpen}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[10px] font-medium text-stone-500 transition-colors active:scale-95 dark:text-stone-400"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
          <span>{tCommon("menu")}</span>
        </button>
      </div>
    </nav>
  );
}

export const MOBILE_TAB_BAR_HEIGHT = "3.5rem";
