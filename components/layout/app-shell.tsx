"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AppShellProps {
  children: React.ReactNode;
  /** Sidebar content - Sidebar component */
  sidebar?: React.ReactNode;
  /** Optional header content */
  header?: React.ReactNode;
  /** Dashboard route for mobile nav (e.g. /admin, /teacher) */
  dashboardHref?: string;
}

export function AppShell({ children, sidebar, header, dashboardHref = "/" }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar - Desktop: full or collapsible; Tablet: collapsible; Mobile: sheet overlay */}
      {sidebar && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <aside
            className={`
            fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-200 bg-white transition-transform
            md:relative md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            dark:border-zinc-800 dark:bg-zinc-950
          `}
          >
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
              <Link href={dashboardHref} className="font-semibold text-zinc-900 dark:text-zinc-100">
                AMS
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <svg
                  className={`h-5 w-5 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4">
              {sidebar}
            </div>
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
        {/* Header */}
        {header && (
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mr-4 rounded p-2 md:hidden"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {header}
          </header>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      {sidebar && dashboardHref && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-zinc-200 bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-1 items-center justify-around gap-1 p-2">
            <Link
              href={dashboardHref}
              className="flex flex-col items-center rounded-lg px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <svg className="mb-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center rounded-lg px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <svg className="mb-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menu
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
