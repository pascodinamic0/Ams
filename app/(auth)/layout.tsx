"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/company/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoVariant = mounted && resolvedTheme === "light" ? "default" : "light";

  return (
    <div className="marketing-surface flex min-h-[100dvh] flex-col">
      <header className="flex shrink-0 items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-2 md:px-6">
        <Link href="/" className="inline-flex">
          <BrandLogo size={36} variant={logoVariant} />
        </Link>
        <ThemeToggle variant="icon" tone="marketing" />
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
