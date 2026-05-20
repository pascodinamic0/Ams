"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] selection:bg-indigo-500 selection:text-white">
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
              scrolled ? "text-slate-900 dark:text-white" : "text-white"
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
              { label: "Find a School", href: "/schools" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                  scrolled
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
                scrolled
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
                scrolled
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

      <footer className="bg-slate-50 dark:bg-[#060a16] border-t border-slate-200 dark:border-slate-800 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white">
                  A
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">AMS</span>
              </Link>
              <p className="max-w-sm text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                The operating system for schools — a cinematic solution to manage, track, and automate your entire educational ecosystem.
              </p>
              <div className="flex gap-4">
                {/* Social Placeholders */}
                {[1, 2, 3].map((s) => (
                  <div key={s} className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center transition-colors hover:bg-indigo-500 group cursor-pointer">
                    <div className="h-4 w-4 bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-2">
              <div className="space-y-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
                  Platform
                </p>
                <ul className="space-y-4">
                  {[
                    { label: "Features", href: "/features" },
                    { label: "Get Access", href: "/get-access" },
                    { label: "Find a School", href: "/schools" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-base font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
                  Support
                </p>
                <ul className="space-y-4">
                  {[
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Documentation", href: "/docs" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-base font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} AMS Education Systems. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                System Status: Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
