import Link from "next/link";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
              A
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">AMS</span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/get-access"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Get Access
            </Link>
            <Link
              href="/schools"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Find a School
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/get-access"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
                  A
                </div>
                <span className="font-bold text-slate-900 dark:text-white">AMS</span>
              </Link>
              <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                The operating system for schools — manage, track, and automate
                everything in one place.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Platform
                </p>
                <ul className="space-y-2">
                  {[
                    { label: "Features", href: "/features" },
                    { label: "Get Access", href: "/get-access" },
                    { label: "Find a School", href: "/schools" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account
                </p>
                <ul className="space-y-2">
                  {[
                    { label: "Login", href: "/login" },
                    { label: "Register", href: "/register" },
                    { label: "Forgot Password", href: "/forgot-password" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} AMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
