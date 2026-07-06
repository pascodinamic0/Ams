"use client";

import { useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;
    startTransition(async () => {
      await setLocale(nextLocale);
      window.location.reload();
    });
  }

  if (variant === "buttons") {
    return (
      <div className={cn("flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800", className)}>
        {(Object.keys(localeNames) as Locale[]).map((code) => (
          <button
            key={code}
            type="button"
            disabled={isPending}
            onClick={() => handleChange(code)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              locale === code
                ? "bg-white text-primary-hover shadow-sm dark:bg-stone-900 dark:text-primary"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
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
        "rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-stone-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200",
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
