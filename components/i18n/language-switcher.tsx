"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { localeNames, type Locale } from "@/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "select" | "buttons";
  /** Dark marketing chrome vs in-app light/dark dual-mode */
  tone?: "default" | "marketing";
  /** Ghost-on-navy, matching Workspace on the marketing hero */
  inverted?: boolean;
}

function LocaleFlag({
  locale,
  dimmed,
  onDark,
}: {
  locale: Locale;
  dimmed?: boolean;
  onDark?: boolean;
}) {
  const frame = cn(
    "h-3 w-[18px] shrink-0 overflow-hidden rounded-[2px] ring-1",
    onDark ? "ring-white/25" : "ring-black/15",
    dimmed && "opacity-45"
  );

  if (locale === "fr") {
    return (
      <span className={cn("flex flex-row flex-nowrap", frame)} aria-hidden>
        <span className="h-full min-w-0 flex-1 bg-[#002395]" />
        <span className="h-full min-w-0 flex-1 bg-white" />
        <span className="h-full min-w-0 flex-1 bg-[#ED2939]" />
      </span>
    );
  }

  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className={frame} aria-hidden>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="2" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export function LanguageSwitcher({
  className,
  variant = "select",
  tone = "default",
  inverted = false,
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("settings");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }
    setOpen(false);
    startTransition(async () => {
      await setLocale(nextLocale);
      window.location.reload();
    });
  }

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (variant === "buttons") {
    if (tone === "marketing") {
      const locales = Object.keys(localeNames) as Locale[];

      return (
        <div ref={rootRef} className={cn("relative", className)}>
          <button
            type="button"
            disabled={isPending}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={t("language")}
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 active:scale-95",
              inverted
                ? "border-white/40 text-white hover:border-white hover:bg-white hover:text-mkt-navy"
                : "border-mkt-ink/40 text-mkt-ink hover:border-mkt-ink hover:bg-mkt-inverse hover:text-mkt-inverse-ink"
            )}
          >
            <LocaleFlag locale={locale} onDark={inverted} />
            {locale.toUpperCase()}
            <ChevronDown
              className={cn("h-3.5 w-3.5 opacity-70 transition-transform duration-200", open && "rotate-180")}
              aria-hidden
            />
          </button>

          {open ? (
            <div
              role="listbox"
              aria-label={t("language")}
              className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] min-w-[12rem] overflow-hidden rounded-2xl border border-mkt-ink/10 bg-mkt-canvas py-1 shadow-xl shadow-black/15"
            >
              {locales.map((code) => {
                const active = locale === code;

                return (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={isPending}
                    onClick={() => handleChange(code)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                      active
                        ? "bg-mkt-ink/[0.06] text-mkt-ink"
                        : "text-mkt-ink/70 hover:bg-mkt-ink/[0.04] hover:text-mkt-ink"
                    )}
                  >
                    <LocaleFlag locale={code} />
                    <span className="flex-1 text-sm font-medium">{localeNames[code]}</span>
                    {active ? <Check className="h-4 w-4 text-mkt-ink" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div
        className={cn("flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800", className)}
        role="group"
        aria-label={t("language")}
      >
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
      aria-label={t("language")}
    >
      {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
