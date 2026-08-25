"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import { usePwaInstall } from "@/lib/pwa/use-pwa-install";
import { IosAddToHomeScreenGuide } from "@/components/pwa/ios-add-to-home-screen-guide";
import { Modal } from "@/components/ui/modal";

export function InstallAppButton() {
  const t = useTranslations("pwa");
  const { installed, ios, canInstall, install } = usePwaInstall();
  const [guideOpen, setGuideOpen] = useState(false);

  if (installed) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
        {t("alreadyInstalledOnDevice", { productName: companyIdentity.productName })}
      </div>
    );
  }

  if (ios) {
    return (
      <>
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
          <p className="font-semibold">{t("installOnIos")}</p>
          <p className="mt-1">{t("tapShareThenAdd")}</p>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="mt-3 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            {t("iosGuide.showHow")}
          </button>
        </div>
        <Modal
          isOpen={guideOpen}
          onClose={() => setGuideOpen(false)}
          title={t("iosGuide.title", {
            productName: companyIdentity.productName,
          })}
        >
          <IosAddToHomeScreenGuide variant="embedded" />
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setGuideOpen(false)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
            >
              {t("iosGuide.gotIt")}
            </button>
          </div>
        </Modal>
      </>
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
      {canInstall ? t("installApp") : t("installFromBrowserMenu")}
    </button>
  );
}
