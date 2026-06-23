"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { companyIdentity } from "@/lib/company/identity";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-slate-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white">
        <WifiOff className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
        {companyIdentity.productName} needs a connection for most features. Cached
        pages may still open, and attendance you saved offline will sync when you
        reconnect.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
        >
          Try again
        </button>
        <Link
          href="/login"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
