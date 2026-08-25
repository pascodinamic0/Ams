"use client";

import Image from "next/image";
import { Smartphone, Share, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePwaInstall } from "@/lib/pwa/use-pwa-install";

export function PwaInstallBand() {
  const t = useTranslations("marketing.install");
  const { installed, ios, canInstall, install } = usePwaInstall();

  async function handleAndroidInstall() {
    if (installed) {
      toast.message(t("installed"));
      return;
    }
    if (canInstall) {
      await install();
      return;
    }
    toast.message(t("androidHint"));
  }

  function handleIosInstall() {
    if (installed) {
      toast.message(t("installed"));
      return;
    }
    toast.message(t("iosStepsTitle"), {
      description: t("iosSteps"),
      duration: 8000,
    });
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/pwa-install-teacher.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-mkt-navy/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-display text-2xl leading-snug text-white sm:text-3xl md:text-4xl">
          {installed ? t("installedTitle") : t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
          {installed ? t("installedSubtitle") : t("subtitle")}
        </p>

        {!installed ? (
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleIosInstall}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-transparent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10"
            >
              <Share className="h-4 w-4" />
              {t("iosButton")}
            </button>
            <button
              type="button"
              onClick={handleAndroidInstall}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-navy transition-colors hover:bg-white/90"
            >
              {canInstall ? (
                <Download className="h-4 w-4" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
              {t("androidButton")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
