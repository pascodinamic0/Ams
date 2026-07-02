"use client";

import { useTranslations } from "next-intl";

export function AuthDivider({ label }: { label?: string }) {
  const t = useTranslations("auth");
  const text = label ?? t("orContinueWithEmail");

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-stone-200 dark:border-stone-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-white px-3 text-stone-500 dark:bg-stone-950 dark:text-stone-400">
          {text}
        </span>
      </div>
    </div>
  );
}
