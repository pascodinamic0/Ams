"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/company/brand-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LogoutButton } from "@/components/layout/logout-button";
import { MOBILE_TAB_BAR_HEIGHT, MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserAvatarMenu } from "@/components/layout/user-avatar-menu";
import { useIsMobile } from "@/lib/pwa/display-mode";
import { cn } from "@/lib/utils";

export type AppShellMobileMode = "tabs" | "stack" | "fullscreen";

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  dashboardHref?: string;
  role?: string;
  mobileMode?: AppShellMobileMode;
}

function resolveMobileMode(pathname: string, mobileMode?: AppShellMobileMode): AppShellMobileMode {
  if (mobileMode) return mobileMode;
  if (/^\/messages\/[^/]+$/.test(pathname)) return "fullscreen";
  return "tabs";
}

export function AppShell({
  children,
  sidebar,
  header,
  dashboardHref = "/",
  role = "student",
  mobileMode,
}: AppShellProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const resolvedMobileMode = resolveMobileMode(pathname, mobileMode);
  const showMobileTabs = Boolean(sidebar) && resolvedMobileMode === "tabs";
  const showMobileHeader = resolvedMobileMode !== "fullscreen";
  const isStack = resolvedMobileMode === "stack";

  const mainPaddingBottom = useMemo(() => {
    if (!isMobile || !showMobileTabs) return undefined;
    return `calc(${MOBILE_TAB_BAR_HEIGHT} + env(safe-area-inset-bottom))`;
  }, [isMobile, showMobileTabs]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen && isMobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {sidebarOpen && sidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-h-screen flex-col bg-stone-50 dark:bg-stone-950 max-md:h-[100dvh] max-md:overflow-hidden md:flex-row">
        {sidebar && (
          <aside
            className={cn(
              "flex w-64 shrink-0 flex-col overflow-hidden border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900",
              "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-full max-md:max-w-[min(100%,20rem)] max-md:transition-transform",
              "md:relative md:h-screen",
              sidebarOpen
                ? "max-md:z-[60] max-md:translate-x-0"
                : "max-md:-translate-x-full"
            )}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) {
                setSidebarOpen(false);
              }
            }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 px-4 pt-[env(safe-area-inset-top)] md:pt-0 dark:border-stone-800">
              <Link href={dashboardHref}>
                <BrandLogo size={32} wordmarkClassName="text-base font-bold text-stone-900 dark:text-white" />
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-600 active:scale-95 dark:hover:bg-stone-800 dark:hover:text-stone-300 md:hidden"
                aria-label={tCommon("closeSidebar")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">{sidebar}</div>

            <div className="space-y-1 border-t border-stone-200 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] dark:border-stone-800 md:pb-3">
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
              >
                <svg className="h-4 w-4 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t("settings")}
              </Link>
              <LanguageSwitcher className="mx-3 mb-2" />
              <LogoutButton />
            </div>
          </aside>
        )}

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            "max-md:min-h-0 max-md:overflow-hidden",
            "md:h-screen md:overflow-y-auto"
          )}
        >
          {showMobileHeader && (
            <header
              className={cn(
                "sticky top-0 z-30 flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-stone-200 bg-white/95 px-4 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-900/95 md:h-16",
                isStack ? "pt-[env(safe-area-inset-top)] md:pt-0" : "pt-[env(safe-area-inset-top)] md:pt-0"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                {sidebar && (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-700 active:scale-95 dark:hover:bg-stone-800 dark:hover:text-stone-200 md:hidden"
                    aria-label={tCommon("openMenu")}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 md:flex"
                  aria-label={tCommon("toggleSidebar")}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </button>

                <div className="min-w-0 truncate text-sm font-semibold text-stone-900 dark:text-white sm:text-base">
                  {header}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <NotificationBell />
                <UserAvatarMenu />
              </div>
            </header>
          )}

          <main
            className={cn(
              "px-4 py-5 md:p-6 lg:p-8",
              resolvedMobileMode === "fullscreen" && "p-0 md:p-6 lg:p-8",
              "max-md:min-h-0 max-md:flex-1 max-md:overflow-auto"
            )}
            style={mainPaddingBottom ? { paddingBottom: mainPaddingBottom } : undefined}
          >
            {children}
          </main>
        </div>
      </div>

      {showMobileTabs && !sidebarOpen && (
        <MobileTabBar role={role} onMenuOpen={() => setSidebarOpen(true)} />
      )}
    </>
  );
}
