"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Share, CheckCircle2, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ShuleOsMark } from "@/components/company/shuleos-mark";
import { companyIdentity } from "@/lib/company/identity";
import { usePwaInstall } from "@/lib/pwa/use-pwa-install";

type PwaInstallShowcaseProps = {
  className?: string;
};

export function PwaInstallShowcase({ className }: PwaInstallShowcaseProps) {
  const t = useTranslations("marketing.home");
  const { installed, ios, canInstall, install } = usePwaInstall();
  const [showIosSteps, setShowIosSteps] = useState(false);

  async function handleInstallClick() {
    if (installed) return;

    if (canInstall) {
      await install();
      return;
    }

    if (ios) {
      setShowIosSteps(true);
      toast.message(t("pwaInstallIos"), {
        description: t("pwaInstallIosSteps"),
        duration: 8000,
      });
      return;
    }

    toast.message(t("pwaInstallBrowser"), {
      description: t("pwaInstallBrowserHint"),
    });
  }

  const ctaLabel = installed
    ? t("pwaInstalled")
    : ios
      ? t("pwaInstallIos")
      : canInstall
        ? t("pwaInstallNow")
        : t("pwaInstallBrowser");

  const ctaHint = installed
    ? t("pwaInstalledHint")
    : ios
      ? t("pwaInstallIosHint")
      : canInstall
        ? t("pwaInstallNowHint")
        : t("pwaInstallBrowserHint");

  const CtaIcon = installed ? CheckCircle2 : ios ? Share : Download;

  return (
    <div className={cn("relative mx-auto w-full max-w-[280px]", className)}>
      {/* Phone visual — image only, brand strip overlaid */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-mkt-ink/10">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src="/images/pwa-install-teacher.jpg"
            alt={t("pwaInstallImageAlt")}
            fill
            sizes="280px"
            className="pointer-events-none object-cover object-top brightness-[0.75] contrast-110"
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 pb-4 pt-14">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-black/55 backdrop-blur-md">
              <ShuleOsMark size={26} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[15px] tracking-tight text-white">
                {companyIdentity.productName}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                <Smartphone className="h-3 w-3" aria-hidden />
                {installed ? t("pwaInstalledBadge") : t("pwaInstallBadge")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA matches site pill language */}
      <button
        type="button"
        onClick={() => void handleInstallClick()}
        disabled={installed}
        aria-label={ctaLabel}
        aria-expanded={ios ? showIosSteps : undefined}
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-transform",
          installed
            ? "cursor-default border border-amber-500/35 bg-amber-500/10 text-amber-500"
            : "bg-mkt-inverse text-mkt-inverse-ink hover:scale-[1.02] active:scale-[0.98]"
        )}
      >
        <CtaIcon className="h-3.5 w-3.5" aria-hidden />
        {ctaLabel}
      </button>

      <p className="mt-2.5 text-center text-xs leading-snug text-mkt-ink/45">
        {ctaHint}
      </p>

      {showIosSteps && !installed && (
        <ol className="mt-5 space-y-0 border-t border-mkt-ink/10 pt-4">
          {[
            t("pwaInstallIosStep1"),
            t("pwaInstallIosStep2"),
            t("pwaInstallIosStep3"),
          ].map((step, index) => (
            <li
              key={step}
              className="flex gap-3 border-b border-mkt-ink/10 py-3 last:border-b-0"
            >
              <span className="mt-0.5 w-5 shrink-0 text-[10px] font-bold tabular-nums text-amber-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-snug text-mkt-ink/65">{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
