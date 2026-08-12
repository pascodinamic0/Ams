"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

const COPY = {
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. We've been notified.",
    retry: "Try again",
  },
  fr: {
    title: "Une erreur s'est produite",
    description: "Une erreur inattendue s'est produite. Nous avons été informés.",
    retry: "Réessayer",
  },
} as const;

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const [locale, setLocale] = useState<"en" | "fr">("en");

  useEffect(() => {
    Sentry.captureException(error);
    const cookie = document.cookie.match(/(?:^|; )AMS_LOCALE=([^;]+)/)?.[1];
    const htmlLang = document.documentElement.lang?.slice(0, 2);
    const next = cookie || htmlLang || navigator.language.slice(0, 2);
    setLocale(next === "fr" ? "fr" : "en");
  }, [error]);

  const copy = COPY[locale];

  return (
    <html lang={locale}>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-8 dark:bg-stone-950">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            {copy.title}
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            {copy.description}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-stone-900 px-4 py-2 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            {copy.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
