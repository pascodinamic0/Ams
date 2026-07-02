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
    <div className="min-h-screen bg-white pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] dark:bg-[#0c1222] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-primary transition-colors hover:text-primary-hover dark:text-primary"
        >
          &larr; {t("backToHome")}
        </Link>
        <header className="mt-8 border-b border-stone-200 pb-8 dark:border-stone-800">
          <h1 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">
            {description}
          </p>
          <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
            {tLegal("lastUpdated")} {lastUpdated}
          </p>
        </header>
        <article className="mt-10 space-y-6 text-base leading-relaxed text-stone-600 dark:text-stone-300 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-stone-900 dark:[&_h2]:text-white [&_h2]:pt-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline dark:[&_a]:text-primary [&_strong]:font-semibold [&_strong]:text-stone-800 dark:[&_strong]:text-stone-200">
          {children}
        </article>
      </div>
    </div>
  );
}
