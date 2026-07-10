"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

interface ThemeToggleProps {
  className?: string;
  /** Compact icon button for the header */
  variant?: "buttons" | "icon";
  /** Marketing chrome (black/white) vs in-app stone dual-mode */
  tone?: "default" | "marketing";
}

export function ThemeToggle({
  className,
  variant = "buttons",
  tone = "default",
}: ThemeToggleProps) {
  const t = useTranslations("settings");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (variant === "icon") {
    const isDark = mounted && resolvedTheme === "dark";
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95",
          tone === "marketing"
            ? "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            : "text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200",
          className
        )}
        aria-label={isDark ? t("themeLight") : t("themeDark")}
        title={isDark ? t("themeLight") : t("themeDark")}
      >
        {!mounted ? (
          <Sun className="h-5 w-5 opacity-0" aria-hidden />
        ) : isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    );
  }

  const options: { value: ThemeValue; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: t("themeLight"), icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: t("themeDark"), icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: t("themeSystem"), icon: <Monitor className="h-4 w-4" /> },
  ];

  const active = mounted ? (theme as ThemeValue) ?? "system" : "system";

  return (
    <div
      className={cn(
        "flex gap-1 rounded-lg p-1",
        tone === "marketing"
          ? "bg-stone-100 dark:bg-white/5"
          : "bg-stone-100 dark:bg-stone-800",
        className
      )}
      role="group"
      aria-label={t("appearance")}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            tone === "marketing"
              ? active === option.value
                ? "bg-white text-stone-900 shadow-sm dark:bg-white dark:text-black"
                : "text-stone-600 hover:text-stone-900 dark:text-white/50 dark:hover:text-white"
              : active === option.value
                ? "bg-white text-primary-hover shadow-sm dark:bg-stone-900 dark:text-primary"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          )}
          aria-pressed={active === option.value}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
