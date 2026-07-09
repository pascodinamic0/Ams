"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/company/brand-logo";
import { SiteFooter } from "@/components/company/site-footer";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
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
  const isSchoolSite =
    pathname === "/schools" || pathname.startsWith("/schools/");
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: labels.home, href: "/" },
    { label: labels.features, href: "/features" },
    { label: labels.getAccess, href: "/get-access" },
    { label: labels.contact, href: "/contact" },
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

  const navLinkClass = (href: string) => {
    const active =
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

    return cn(
      "whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors lg:px-4",
      active ? "text-white" : "text-white/65 hover:text-white"
    );
  };

  return (
    <div className="marketing-surface min-h-screen selection:bg-amber-500 selection:text-black">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          "px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6 md:pt-0 lg:px-8",
          solidHeader
            ? "pb-3 md:border-b md:border-white/10 md:bg-black/80 md:py-4 md:backdrop-blur-xl lg:py-5"
            : "pb-3 md:bg-transparent md:py-5 lg:py-6"
        )}
      >
        <div
          className={cn(
            "mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:min-h-16 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6 lg:min-h-[4.25rem] lg:gap-10",
            "max-md:min-h-14 max-md:rounded-2xl max-md:border max-md:border-white/10 max-md:bg-black/85 max-md:px-4 max-md:shadow-lg max-md:shadow-black/30 max-md:backdrop-blur-xl"
          )}
        >
          <Link
            href="/"
            className="group min-w-0 shrink-0 justify-self-start rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="ShuleOS home"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
              <BrandLogo size={38} className="gap-2.5 md:gap-3" variant="light" />
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

          <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end md:gap-3 lg:gap-4">
            <Link
              href="/login"
              className="hidden whitespace-nowrap rounded-full border border-white/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-all hover:border-white hover:bg-white/5 xl:inline-flex"
            >
              {labels.login}
            </Link>
            <Link
              href="/get-access"
              className="hidden whitespace-nowrap rounded-full border border-white/40 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black active:scale-95 md:inline-flex lg:px-6"
            >
              {labels.getStarted}
            </Link>
            <button
              type="button"
              aria-label={mobileMenuOpen ? labels.closeMenu : labels.openMenu}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-all hover:bg-white/10 active:scale-95 md:hidden"
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
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-3 right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex w-[calc(100%-1.5rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/50 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  {labels.menu}
                </span>
                <button
                  type="button"
                  aria-label={labels.closeMenu}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-95"
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
                        ? "bg-white text-black"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-full border border-white/20 px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/80 hover:border-white hover:text-white"
                >
                  {labels.login}
                </Link>
                <div className="mt-4 px-2">
                  <LanguageSwitcher variant="buttons" tone="marketing" />
                </div>
              </div>
              <div className="border-t border-white/10 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                <Link
                  href="/get-access"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-white px-4 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition-all active:scale-[0.98]"
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
