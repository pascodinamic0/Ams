"use client";

import Image from "next/image";
import { Download, CheckCircle2 } from "lucide-react";
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

  async function handleInstallClick() {
    if (installed) return;
    if (canInstall) {
      await install();
      return;
    }
    if (!ios) {
      toast.message(t("pwaInstallBrowser"), {
        description: t("pwaInstallBrowserHint"),
      });
    }
  }

  const installLabel = installed
    ? t("pwaInstalled")
    : ios
      ? t("pwaInstallIos")
      : canInstall
        ? t("pwaInstallNow")
        : t("pwaInstallBrowser");

  const installHint = installed
    ? t("pwaInstalledHint")
    : ios
      ? t("pwaInstallIosHint")
      : canInstall
        ? t("pwaInstallNowHint")
        : t("pwaInstallBrowserHint");

  return (
    <div className={cn("relative mx-auto w-full max-w-sm", className)}>
      <div className="absolute -inset-4 rounded-[2.5rem] bg-amber-500/10 blur-2xl" />
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={installed}
        aria-label={installLabel}
        className={cn(
          "group relative w-full overflow-hidden rounded-[2rem] border border-white/15 bg-black/60 text-left backdrop-blur-sm transition-all",
          !installed &&
            "cursor-pointer hover:border-white/35 hover:bg-black/80 active:scale-[0.99]",
          installed && "cursor-default"
        )}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="/images/pwa-install-teacher.jpg"
            alt={t("pwaInstallImageAlt")}
            fill
            sizes="(max-width: 1024px) 100vw, 384px"
            className="object-cover object-top brightness-75 contrast-110 transition-transform duration-500 group-hover:scale-[1.02]"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>

        <div className="relative px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          <p className="text-center font-display text-lg tracking-tight text-white">
            {companyIdentity.productName}
          </p>
          <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
            {companyIdentity.tagline}
          </p>

          <div
            className={cn(
              "mt-5 flex items-center gap-3 rounded-full border px-4 py-3 transition-colors",
              installed
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-white/15 bg-white/5 group-hover:border-white/30"
            )}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <ShuleOsMark size={36} />
              {installed && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45">
                  <CheckCircle2 className="h-5 w-5 text-amber-500" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-500">
                {installed ? t("pwaInstalledBadge") : t("pwaInstallBadge")}
              </p>
              <p className="text-sm font-semibold text-white">{installLabel}</p>
              <p className="mt-0.5 text-xs leading-snug text-white/45">{installHint}</p>
            </div>
            {canInstall && !installed && (
              <Download className="h-4 w-4 shrink-0 text-white/50 transition-transform group-hover:translate-y-0.5" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
