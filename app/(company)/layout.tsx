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
    { label: t("contact"), href: "/contact" },
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

  const navLinkClass = (href: string) =>
    cn(
      "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all lg:px-4 lg:py-2.5 lg:text-[0.9375rem]",
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
        ? solidHeader
          ? "bg-primary-light text-primary-hover dark:bg-primary-light/50 dark:text-primary"
          : "bg-white/15 text-white"
        : solidHeader
          ? "text-stone-600 hover:bg-stone-100 hover:text-primary dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-primary"
          : "text-teal-100 hover:bg-white/10 hover:text-white"
    );


  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1222] selection:bg-primary selection:text-white">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          "px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6 md:pt-0 lg:px-8",
          solidHeader
            ? "pb-3 md:border-b md:border-stone-200/50 md:bg-white/85 md:py-4 md:backdrop-blur-xl md:dark:border-stone-800/50 md:dark:bg-[#0c1222]/85 lg:py-5"
            : "pb-3 md:bg-transparent md:py-5 lg:py-6"
        )}
      >
        <div
          className={cn(
            "mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:min-h-16 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6 lg:min-h-[4.25rem] lg:gap-10",
            "max-md:min-h-14 max-md:rounded-2xl max-md:border max-md:px-4 max-md:shadow-lg max-md:backdrop-blur-xl",
            solidHeader
              ? "max-md:border-stone-200/70 max-md:bg-white/90 max-md:shadow-stone-950/5 dark:max-md:border-stone-800/70 dark:max-md:bg-[#0a0f1e]/90"
              : "max-md:border-white/10 max-md:bg-teal-950/25 max-md:shadow-teal-950/20"
          )}
        >
          <Link
            href="/"
            className="group min-w-0 shrink-0 justify-self-start rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="ShuleOS home"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
              <BrandLogo
                size={38}
                className="gap-2.5 md:gap-3"
                variant={solidHeader ? "dark" : "light"}
              />
            </motion.div>
          </Link>

          <nav
            className="hidden items-center justify-center gap-0.5 md:flex lg:gap-1"
            aria-label={tCommon("menu")}
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
              className={cn(
                "hidden whitespace-nowrap px-1 text-sm font-semibold transition-all xl:inline-flex",
                solidHeader
                  ? "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                  : "text-teal-100 hover:text-white"
              )}
            >
              {t("login")}
            </Link>
            <Link
              href="/get-access"
              className={cn(
                "hidden whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 md:inline-flex lg:px-5 lg:py-3",
                solidHeader
                  ? "bg-primary text-white shadow-primary/20 hover:bg-primary"
                  : "bg-white text-teal-950 shadow-white/10 hover:bg-primary-light"
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
                "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all active:scale-95 md:hidden",
                solidHeader
                  ? "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
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
              className="fixed bottom-3 right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex w-[calc(100%-1.5rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-2xl shadow-stone-950/25 dark:border-stone-800 dark:bg-[#0c1222] md:hidden"
            >
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-800">
                <span className="text-lg font-black text-stone-900 dark:text-white">{tCommon("menu")}</span>
                <button
                  type="button"
                  aria-label={tCommon("closeMenu")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 transition-all hover:bg-stone-100 active:scale-95 dark:text-stone-300 dark:hover:bg-stone-800"
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
                        ? "bg-primary-light text-primary dark:bg-primary-light/50 dark:text-primary"
                        : "text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-900"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-2xl px-4 py-3.5 text-base font-bold text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-900"
                >
                  {t("login")}
                </Link>
                <div className="mt-4 px-2">
                  <LanguageSwitcher variant="buttons" />
                </div>
              </div>
              <div className="border-t border-stone-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] dark:border-stone-800">
                <Link
                  href="/get-access"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {t("getStarted")}
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <main>{children}</main>

      <SiteFooter className="hidden md:block" />
    </div>
  );
}
