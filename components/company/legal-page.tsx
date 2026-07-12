"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function LegalPage({
  title,
  description,
  lastUpdated,
  children,
}: {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("common");
  const tLegal = useTranslations("marketing.legal");

  return (
    <div className="min-h-screen bg-black pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-white"
        >
          &larr; {t("backToHome")}
        </Link>
        <header className="mt-8 border-b border-white/10 pb-8">
          <h1 className="font-display text-3xl tracking-tight text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/55 sm:text-lg">
            {description}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/35">
            {tLegal("lastUpdated")} {lastUpdated}
          </p>
        </header>
        <article className="mt-10 space-y-6 text-base leading-relaxed text-white/60 [&_h2]:pt-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:tracking-tight [&_h2]:text-white [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-amber-500 [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:font-semibold [&_strong]:text-white/85">
          {children}
        </article>
      </div>
    </div>
  );
}
