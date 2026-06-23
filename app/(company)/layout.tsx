"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/company/brand-logo";
import { SiteFooter } from "@/components/company/site-footer";
import { cn } from "@/lib/utils";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSchoolSite =
    pathname === "/schools" || pathname.startsWith("/schools/");
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Get Access", href: "/get-access" },
  ];

  if (isSchoolSite) {
    return <>{children}</>;
  }

  // Home uses a dark hero (transparent header + light text). Other pages use a light background.
  const solidHeader = scrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] selection:bg-indigo-500 selection:text-white">
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          solidHeader
            ? "bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="mx-auto flex h-10 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
              <BrandLogo
                wordmarkClassName={cn(
                  "transition-colors",
                  solidHeader ? "text-slate-900 dark:text-white" : "text-white"
                )}
              />
            </motion.div>
          </Link>

          {/* Nav — desktop */}
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

          {/* CTA + mobile menu toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className={cn(
                "hidden sm:block text-sm font-bold transition-all",
                solidHeader
                  ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  : "text-indigo-100 hover:text-white"
              )}
            >
              Login
            </Link>
            <Link
              href="/get-access"
              className={cn(
                "rounded-xl px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
                solidHeader
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20"
                  : "bg-white text-indigo-950 hover:bg-indigo-50 shadow-white/10"
              )}
            >
              Get Started
            </Link>
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all md:hidden",
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

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
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
              className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col bg-white dark:bg-[#0a0f1e] shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <span className="text-lg font-black text-slate-900 dark:text-white">Menu</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-xl px-4 py-3.5 text-base font-bold transition-colors",
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
                  className="mt-2 rounded-xl px-4 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Login
                </Link>
              </div>
              <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <Link
                  href="/get-access"
                  className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/20"
                >
                  Get Started
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
