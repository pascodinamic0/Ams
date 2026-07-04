"use client";

import { Download, Share } from "lucide-react";
import { companyIdentity } from "@/lib/company/identity";
import { usePwaInstall } from "@/lib/pwa/use-pwa-install";

export function InstallAppButton() {
  const { installed, ios, canInstall, install } = usePwaInstall();

  if (installed) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
        {companyIdentity.productName} is installed on this device.
      </div>
    );
  }

  if (ios) {
    return (
      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
        <p className="font-semibold">Install on iPhone or iPad</p>
        <p className="mt-1 inline-flex items-center gap-2">
          Tap <Share className="h-4 w-4" /> Share, then choose{" "}
          <strong>Add to Home Screen</strong>.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void install()}
      disabled={!canInstall}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
    >
      <Download className="h-4 w-4" />
      {canInstall ? "Install app" : "Install from browser menu"}
    </button>
  );
}
