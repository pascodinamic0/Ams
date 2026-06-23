"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/company/brand-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LogoutButton } from "@/components/layout/logout-button";
import { NotificationBell } from "@/components/layout/notification-bell";

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  dashboardHref?: string;
}

export function AppShell({
  children,
  sidebar,
  header,
  dashboardHref = "/",
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    document.body.style.overflow = sidebarOpen && isMobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 md:flex-row">
      {sidebar && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed bottom-3 left-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex w-[calc(100%-1.5rem)] max-w-72 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 transition-transform
              md:inset-y-0 md:left-0 md:top-0 md:bottom-auto md:relative md:w-64 md:max-w-none md:rounded-none md:border-y-0 md:border-l-0 md:shadow-none md:translate-x-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-[110%]"}
              dark:border-slate-800 dark:bg-slate-900
            `}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) {
                setSidebarOpen(false);
              }
            }}
          >
            {/* Logo area */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
              <Link href={dashboardHref}>
                <BrandLogo size={32} wordmarkClassName="text-base font-bold text-slate-900 dark:text-white" />
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-95 dark:hover:bg-slate-800 dark:hover:text-slate-300 md:hidden"
                aria-label={tCommon("closeSidebar")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-4">{sidebar}</div>

            {/* Bottom links */}
            <div className="space-y-1 border-t border-slate-200 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] dark:border-slate-800 md:pb-3">
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <svg className="h-4 w-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t("settings")}
              </Link>
              <LanguageSwitcher className="mx-3 mb-2" />
              <LogoutButton />
            </div>
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+4.5rem)] md:pb-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 md:h-16 md:pt-0">
          <div className="flex min-w-0 items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
              aria-label={tCommon("openMenu")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 md:flex"
              aria-label={tCommon("toggleSidebar")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            <div className="min-w-0 truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
              {header}
            </div>
          </div>

          {/* Right side: notifications + avatar */}
          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto px-4 py-5 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {sidebar && (
        <nav className="fixed inset-x-3 bottom-3 z-50 flex rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-2xl shadow-slate-950/10 backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex flex-1 items-center justify-around gap-1 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
            <Link
              href={dashboardHref}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-950/40"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {tCommon("home")}
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:text-slate-400 dark:hover:bg-indigo-950/40"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {tCommon("menu")}
            </button>
            <NotificationBell
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-950/40"
              showLabel
            />
          </div>
        </nav>
      )}
    </div>
  );
}
