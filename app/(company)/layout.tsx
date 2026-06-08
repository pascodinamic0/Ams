"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SiteFooter } from "@/components/company/site-footer";
import { cn } from "@/lib/utils";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  // Home uses a dark hero (transparent header + light text). Other pages use a light background.
  const solidHeader = scrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-600/20 transition-all group-hover:bg-indigo-500"
            >
              A
            </motion.div>
            <span className={cn(
              "text-xl font-black tracking-tight transition-colors",
              solidHeader ? "text-slate-900 dark:text-white" : "text-white"
            )}>
              AMS
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: "Home", href: "/" },
              { label: "Features", href: "/features" },
              { label: "Get Access", href: "/get-access" },
            ].map((link) => (
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

          {/* CTA */}
          <div className="flex items-center gap-4">
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
                "rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
                solidHeader
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20"
                  : "bg-white text-indigo-950 hover:bg-indigo-50 shadow-white/10"
              )}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}
