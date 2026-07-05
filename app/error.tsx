"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
        Something went wrong
      </h1>
      <p className="text-stone-600 dark:text-stone-400">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-stone-900 px-4 py-2 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
      >
        Try again
      </button>
    </div>
  );
}
