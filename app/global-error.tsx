"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-8 dark:bg-stone-950">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            Something went wrong
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            An unexpected error occurred. We&apos;ve been notified.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-stone-900 px-4 py-2 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
