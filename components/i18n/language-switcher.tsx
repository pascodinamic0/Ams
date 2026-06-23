"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { localeNames, type Locale } from "@/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "select" | "buttons";
}

export function LanguageSwitcher({
  className,
  variant = "select",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;
    startTransition(async () => {
      await setLocale(nextLocale);
      router.refresh();
    });
  }

  if (variant === "buttons") {
    return (
      <div className={cn("flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800", className)}>
        {(Object.keys(localeNames) as Locale[]).map((code) => (
          <button
            key={code}
            type="button"
            disabled={isPending}
            onClick={() => handleChange(code)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              locale === code
                ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      value={locale}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as Locale)}
      className={cn(
        "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
        className
      )}
      aria-label="Language"
    >
      {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
