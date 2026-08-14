"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SchoolNavLink = {
  href: string;
  label: string;
};

type SchoolSiteHeaderProps = {
  schoolName: string;
  logoUrl: string | null;
  homeHref: string;
  tagline?: string;
  accentColor: string;
  links: SchoolNavLink[];
  loginHref: string;
  loginLabel: string;
  applyHref: string;
  applyLabel: string;
  menuLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  contentWidthClass?: string;
};

function isCurrentPath(pathname: string, href: string) {
  const path = href.split("#")[0];
  if (!path || path === "#") return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SchoolSiteHeader({
  schoolName,
  logoUrl,
  homeHref,
  tagline,
  accentColor,
  links,
  loginHref,
  loginLabel,
  applyHref,
  applyLabel,
  menuLabel,
  openMenuLabel,
  closeMenuLabel,
  contentWidthClass = "max-w-6xl",
}: SchoolSiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="h-0.5" style={{ backgroundColor: accentColor }} />
      <div className="border-b border-white/10 bg-black/45 pt-[env(safe-area-inset-top)] shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <div
          className={cn(
            "mx-auto grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 sm:min-h-16 sm:gap-4 sm:px-5 sm:py-2.5 lg:min-h-[4.25rem] lg:grid-cols-[minmax(0,auto)_1fr_auto] lg:gap-8 lg:px-6",
            contentWidthClass
          )}
        >
          <Link
            href={homeHref}
            className="flex min-w-0 items-center gap-3 text-white"
          >
            {logoUrl ? (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-md ring-1 ring-white/40 sm:h-11 sm:w-11">
                <img
                  src={logoUrl}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </span>
            ) : null}
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold leading-tight tracking-tight sm:text-sm">
                {schoolName}
              </span>
              {tagline ? (
                <span className="mt-0.5 hidden truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:block">
                  {tagline}
                </span>
              ) : null}
            </span>
          </Link>

          <nav
            className="hidden items-center justify-center gap-1 lg:flex"
            aria-label={menuLabel}
          >
            {links.map((link) => {
              const active = isCurrentPath(pathname, link.href);
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={cn(
                    "group relative whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
                    active ? "text-white" : "text-white/70 hover:text-white"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 bottom-1 h-px origin-center bg-white transition-transform duration-200",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Link
              href={loginHref}
              className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-white lg:inline"
            >
              {loginLabel}
            </Link>
            <span className="hidden h-4 w-px bg-white/25 lg:block" aria-hidden />
            <Link
              href={applyHref}
              className="hidden items-center rounded-full bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-900 transition-colors hover:bg-white/90 lg:inline-flex"
            >
              {applyLabel}
            </Link>
            <button
              type="button"
              aria-label={open ? closeMenuLabel : openMenuLabel}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label={closeMenuLabel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              aria-label={menuLabel}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-3 top-[calc(env(safe-area-inset-top)+4.25rem)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-stone-950/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-0.5">
                {links.map((link) => {
                  const active = isCurrentPath(pathname, link.href);
                  return (
                    <Link
                      key={`mobile-${link.href}-${link.label}`}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-xl px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors",
                        active
                          ? "bg-white text-stone-900"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
                <Link
                  href={loginHref}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-white/75 hover:bg-white/10 hover:text-white"
                >
                  {loginLabel}
                </Link>
                <Link
                  href={applyHref}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-900"
                >
                  {applyLabel}
                </Link>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
