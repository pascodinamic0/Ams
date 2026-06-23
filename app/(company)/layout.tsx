"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/company/brand-logo";
import { SiteFooter } from "@/components/company/site-footer";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { cn } from "@/lib/utils";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("marketing.nav");
  const tCommon = useTranslations("common");
  const isSchoolSite =
    pathname === "/schools" || pathname.startsWith("/schools/");
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t("home"), href: "/" },
    { label: t("features"), href: "/features" },
    { label: t("getAccess"), href: "/get-access" },
  ];

  const solidHeader = scrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (isSchoolSite) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] selection:bg-indigo-500 selection:text-white">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top)+0.625rem)] transition-all duration-500 sm:px-0 sm:pt-0",
          solidHeader
            ? "pb-2 sm:bg-white/80 sm:py-3 sm:backdrop-blur-xl sm:border-b sm:border-slate-200/50 sm:dark:bg-[#0a0f1e]/80 sm:dark:border-slate-800/50"
            : "pb-2.5 sm:bg-transparent sm:py-5"
        )}
      >
        <div
          className={cn(
            "mx-auto flex min-h-12 w-full max-w-7xl items-center justify-between gap-2 rounded-2xl border px-3 shadow-lg backdrop-blur-xl transition-all sm:h-10 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-6 sm:shadow-none sm:backdrop-blur-0 lg:px-8",
            solidHeader
              ? "border-slate-200/70 bg-white/90 shadow-slate-950/5 dark:border-slate-800/70 dark:bg-[#0a0f1e]/90"
              : "border-white/10 bg-indigo-950/25 shadow-indigo-950/20"
          )}
        >
          <Link href="/" className="group min-w-0 shrink">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
              <BrandLogo
                size={34}
                className="gap-2 sm:gap-3"
                wordmarkClassName={cn(
                  "text-lg transition-colors sm:text-xl",
                  solidHeader ? "text-slate-900 dark:text-white" : "text-white"
                )}
              />
            </motion.div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                  solidHeader
                    ? "text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    : "text-indigo-100 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
            <LanguageSwitcher
              variant="buttons"
              className={cn(
                "rounded-xl bg-white/10 p-0.5 dark:bg-white/10 [&_button]:px-2 [&_button]:py-1.5 [&_button]:text-xs sm:bg-slate-100 sm:p-1 sm:dark:bg-slate-800 sm:[&_button]:px-3 sm:[&_button]:text-sm",
                solidHeader
                  ? "bg-slate-100 dark:bg-slate-800"
                  : "[&_button:not([class*='bg-white'])]:text-indigo-100 [&_button:not([class*='bg-white'])]:hover:text-white"
              )}
            />
            <Link
              href="/login"
              className={cn(
                "hidden sm:block text-sm font-bold transition-all",
                solidHeader
                  ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  : "text-indigo-100 hover:text-white"
              )}
            >
              {t("login")}
            </Link>
            <Link
              href="/get-access"
              className={cn(
                "hidden rounded-xl px-4 py-2 text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 sm:inline-flex sm:px-6 sm:py-2.5",
                solidHeader
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20"
                  : "bg-white text-indigo-950 hover:bg-indigo-50 shadow-white/10"
              )}
            >
              {t("getStarted")}
            </Link>
            <button
              type="button"
              aria-label={mobileMenuOpen ? tCommon("closeMenu") : tCommon("openMenu")}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95 md:hidden",
                solidHeader
                  ? "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  : "text-white hover:bg-white/10"
              )}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label={tCommon("closeMenu")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-3 right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex w-[calc(100%-1.5rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/25 dark:border-slate-800 dark:bg-[#0a0f1e] md:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <span className="text-lg font-black text-slate-900 dark:text-white">{tCommon("menu")}</span>
                <button
                  type="button"
                  aria-label={tCommon("closeMenu")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-all hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3.5 text-base font-bold transition-colors",
                      pathname === link.href
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {t("login")}
                </Link>
                <div className="mt-4 px-2">
                  <LanguageSwitcher variant="buttons" />
                </div>
              </div>
              <div className="border-t border-slate-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] dark:border-slate-800">
                <Link
                  href="/get-access"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                >
                  {t("getStarted")}
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}
