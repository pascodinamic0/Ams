"use client";

import { useTranslations } from "next-intl";

export function AuthDivider({ label }: { label?: string }) {
  const t = useTranslations("auth");
  const text = label ?? t("orContinueWithEmail");

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-stone-200 dark:border-white/10" />
      </div>
      <div className="relative flex justify-center text-[10px] uppercase tracking-[0.16em]">
        <span className="bg-stone-50 dark:bg-black px-3 text-stone-400 dark:text-white/40">{text}</span>
      </div>
    </div>
  );
}
