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
  // Hero video stays dark — keep light chrome until the solid header kicks in
  const overHero = isHome && !scrolled;
  const isDark = !mounted || resolvedTheme !== "light";
  const useLightChrome = overHero || isDark;
  const logoVariant = useLightChrome ? "light" : "default";

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
      useLightChrome
        ? active
          ? "text-white"
          : "text-white/65 hover:text-white"
        : active
          ? "text-mkt-ink"
          : "text-mkt-ink/65 hover:text-mkt-ink"
    );
  };

  return (
    <div className="marketing-surface min-h-screen selection:bg-amber-500 selection:text-black">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          "px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6 md:pt-0 lg:px-8",
          solidHeader
            ? "pb-3 md:border-b md:border-mkt-ink/10 md:bg-mkt-header md:py-4 md:backdrop-blur-xl lg:py-5"
            : "pb-3 md:bg-transparent md:py-5 lg:py-6"
        )}
      >
        <div
          className={cn(
            "mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:min-h-16 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6 lg:min-h-[4.25rem] lg:gap-10",
            overHero
              ? "max-md:min-h-14 max-md:rounded-2xl max-md:border max-md:border-white/10 max-md:bg-black/85 max-md:px-4 max-md:shadow-lg max-md:shadow-black/30 max-md:backdrop-blur-xl"
              : "max-md:min-h-14 max-md:rounded-2xl max-md:border max-md:border-mkt-ink/10 max-md:bg-mkt-header max-md:px-4 max-md:shadow-lg max-md:shadow-black/10 max-md:backdrop-blur-xl"
          )}
        >
          <Link
            href="/"
            className="group min-w-0 shrink-0 justify-self-start rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-mkt-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
                "h-10 w-10 rounded-xl",
                useLightChrome &&
                  "text-white/80 hover:bg-white/10 hover:text-white dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            />
            <Link
              href="/login"
              className={cn(
                "hidden whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all xl:inline-flex",
                useLightChrome
                  ? "border-white/30 text-white hover:border-white hover:bg-white/5"
                  : "border-mkt-ink/30 text-mkt-ink hover:border-mkt-ink hover:bg-mkt-ink/5"
              )}
            >
              {labels.login}
            </Link>
            <Link
              href="/get-access"
              className={cn(
                "hidden whitespace-nowrap rounded-full border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 active:scale-95 md:inline-flex lg:px-6",
                useLightChrome
                  ? "border-white/40 text-white hover:border-white hover:bg-white hover:text-black"
                  : "border-mkt-ink/40 text-mkt-ink hover:border-mkt-ink hover:bg-mkt-inverse hover:text-mkt-inverse-ink"
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
                useLightChrome
                  ? "text-white hover:bg-white/10"
                  : "text-mkt-ink hover:bg-mkt-ink/10"
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
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-3 right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex w-[calc(100%-1.5rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-mkt-ink/10 bg-mkt-canvas shadow-2xl shadow-black/20 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-mkt-ink/10 px-5 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mkt-ink">
                  {labels.menu}
                </span>
                <button
                  type="button"
                  aria-label={labels.closeMenu}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-mkt-ink/70 transition-all hover:bg-mkt-ink/10 hover:text-mkt-ink active:scale-95"
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
                        ? "bg-mkt-inverse text-mkt-inverse-ink"
                        : "text-mkt-ink/70 hover:bg-mkt-ink/5 hover:text-mkt-ink"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-full border border-mkt-ink/20 px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-mkt-ink/80 hover:border-mkt-ink hover:text-mkt-ink"
                >
                  {labels.login}
                </Link>
                <div className="mt-4 flex items-center gap-3 px-2">
                  <LanguageSwitcher variant="buttons" tone="marketing" />
                  <ThemeToggle variant="icon" tone="marketing" />
                </div>
              </div>
              <div className="border-t border-mkt-ink/10 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                <Link
                  href="/get-access"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-mkt-inverse px-4 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-mkt-inverse-ink transition-all active:scale-[0.98]"
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
