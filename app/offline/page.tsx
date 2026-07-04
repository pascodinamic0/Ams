"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";

export default function OfflinePage() {
  const t = useTranslations("pwa");
  const tc = useTranslations("common");

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-stone-50 px-6 text-center dark:bg-stone-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
        <WifiOff className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-stone-900 dark:text-white">
        {t("offlineTitle")}
      </h1>
      <p className="mt-2 max-w-md text-sm text-stone-600 dark:text-stone-400">
        {t("offlineDescription", { productName: companyIdentity.productName })}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary"
        >
          {tc("tryAgain")}
        </button>
        <Link
          href="/login"
          className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-bold text-stone-700 hover:bg-white dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900"
        >
          {t("goToLogin")}
        </Link>
      </div>
    </div>
  );
}
