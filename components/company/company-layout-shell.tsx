"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/company/brand-logo";
import { SiteFooter } from "@/components/company/site-footer";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import type { CompanyFooterLabels, CompanyNavLabels } from "@/lib/company/layout-labels";

export function CompanyLayoutShell({
  labels,
  footerLabels,
  children,
}: {
  labels: CompanyNavLabels;
  footerLabels: CompanyFooterLabels;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isSchoolSite =
    pathname === "/schools" || pathname.startsWith("/schools/");
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navLinks = [
    { label: labels.home, href: "/" },
    { label: labels.features, href: "/features" },
    { label: labels.getAccess, href: "/get-access" },
    { label: labels.contact, href: "/contact" },
  ];

  const solidHeader = scrolled || !isHome;
  // Transparent home hero sits on dark video — keep white chrome there even in light mode
  const onDarkHero = !solidHeader;
  const logoVariant =
    onDarkHero || !(mounted && resolvedTheme === "light") ? "light" : "default";

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const navLinkClass = (href: string) => {
    const active =
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

    return cn(
      "whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors lg:px-4",
      onDarkHero
        ? active
          ? "text-white"
          : "text-white/65 hover:text-white"
        : active
          ? "text-stone-900 dark:text-white"
          : "text-stone-500 hover:text-stone-900 dark:text-white/65 dark:hover:text-white"
    );
  };

  return (
    <div className="marketing-surface min-h-screen selection:bg-amber-500 selection:text-black">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          "px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6 md:pt-0 lg:px-8",
          solidHeader
            ? "pb-3 md:border-b md:border-stone-200/80 md:bg-stone-50/90 md:py-4 md:backdrop-blur-xl dark:md:border-white/10 dark:md:bg-black/80 lg:py-5"
            : "pb-3 md:bg-transparent md:py-5 lg:py-6"
        )}
      >
        <div
          className={cn(
            "mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:min-h-16 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6 lg:min-h-[4.25rem] lg:gap-10",
            "max-md:min-h-14 max-md:rounded-2xl max-md:border max-md:border-stone-200 max-md:bg-white/95 max-md:px-4 max-md:shadow-lg max-md:shadow-stone-900/5 max-md:backdrop-blur-xl dark:max-md:border-white/10 dark:max-md:bg-black/85 dark:max-md:shadow-black/30"
          )}
        >
          <Link
            href="/"
            className="group min-w-0 shrink-0 justify-self-start rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="ShuleOS home"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
              <BrandLogo size={38} className="gap-2.5 md:gap-3" variant={logoVariant} />
            </motion.div>
          </Link>

          <nav
            className="hidden items-center justify-center gap-0.5 md:flex lg:gap-1"
            aria-label={labels.menu}
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-1.5 justify-self-end md:gap-2 lg:gap-3">
            <ThemeToggle
              variant="icon"
              tone="marketing"
              className={cn(
                "hidden sm:inline-flex",
                onDarkHero && "text-white/80 hover:bg-white/10 hover:text-white dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            />
            <Link
              href="/login"
              className={cn(
                "hidden whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all xl:inline-flex",
                onDarkHero
                  ? "border-white/40 text-white hover:border-white hover:bg-white/10"
                  : "border-stone-300 text-stone-700 hover:border-stone-900 hover:bg-stone-100 dark:border-white/30 dark:text-white dark:hover:border-white dark:hover:bg-white/5"
              )}
            >
              {labels.login}
            </Link>
            <Link
              href="/get-access"
              className={cn(
                "hidden whitespace-nowrap rounded-full border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 active:scale-95 md:inline-flex lg:px-6",
                onDarkHero
                  ? "border-white/50 bg-white text-black hover:bg-white/90"
                  : "border-stone-900 bg-stone-900 text-white hover:bg-stone-800 dark:border-white/40 dark:bg-transparent dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
              )}
            >
              {labels.getStarted}
            </Link>
            <button
              type="button"
              aria-label={mobileMenuOpen ? labels.closeMenu : labels.openMenu}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all active:scale-95 md:hidden",
                onDarkHero
                  ? "text-white hover:bg-white/10"
                  : "text-stone-700 hover:bg-stone-100 dark:text-white dark:hover:bg-white/10"
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
              aria-label={labels.closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm dark:bg-black/70 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-3 right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex w-[calc(100%-1.5rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-2xl shadow-stone-900/10 dark:border-white/10 dark:bg-black dark:shadow-black/50 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-white/10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-900 dark:text-white">
                  {labels.menu}
                </span>
                <button
                  type="button"
                  aria-label={labels.closeMenu}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-900 active:scale-95 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
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
                      "rounded-full px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors",
                      pathname === link.href
                        ? "bg-stone-900 text-white dark:bg-white dark:text-black"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-full border border-stone-300 px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-700 hover:border-stone-900 hover:text-stone-900 dark:border-white/20 dark:text-white/80 dark:hover:border-white dark:hover:text-white"
                >
                  {labels.login}
                </Link>
                <div className="mt-4 space-y-3 px-2">
                  <ThemeToggle tone="marketing" />
                  <LanguageSwitcher variant="buttons" tone="marketing" />
                </div>
              </div>
              <div className="border-t border-stone-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] dark:border-white/10">
                <Link
                  href="/get-access"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-stone-900 px-4 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-all active:scale-[0.98] dark:bg-white dark:text-black"
                >
                  {labels.getStarted}
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <main>{children}</main>

      <SiteFooter labels={footerLabels} />
    </div>
  );
}
