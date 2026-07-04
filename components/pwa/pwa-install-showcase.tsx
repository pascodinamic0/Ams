"use client";

import Image from "next/image";
import { Download, Share, CheckCircle2, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
      <div className="absolute -inset-4 rounded-[2.5rem] bg-teal-500/20 blur-2xl" />
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={installed}
        aria-label={installLabel}
        className={cn(
          "group relative w-full overflow-hidden rounded-[2rem] border border-teal-800/50 bg-teal-900/50 text-left backdrop-blur-sm transition-all",
          !installed && "cursor-pointer hover:border-teal-600/60 hover:bg-teal-900/70 hover:shadow-xl hover:shadow-teal-900/40 active:scale-[0.99]",
          installed && "cursor-default"
        )}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="/images/pwa-install-teacher.png"
            alt={t("pwaInstallImageAlt")}
            fill
            sizes="(max-width: 1024px) 100vw, 384px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-950/20 to-transparent" />
        </div>

        <div className="relative px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          <p className="text-center text-lg font-bold text-white">
            {companyIdentity.productName}
          </p>
          <p className="mt-1 text-center text-sm text-teal-200/70">
            {companyIdentity.tagline}
          </p>

          <div
            className={cn(
              "mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
              installed
                ? "border-emerald-500/30 bg-emerald-950/40"
                : canInstall
                  ? "border-teal-500/40 bg-teal-800/50 group-hover:border-teal-400/60 group-hover:bg-teal-800/70"
                  : "border-teal-700/40 bg-teal-900/60"
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                installed ? "bg-emerald-800/60" : "bg-teal-700/80"
              )}
            >
              {installed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              ) : ios ? (
                <Share className="h-5 w-5 text-teal-100" />
              ) : canInstall ? (
                <Download className="h-5 w-5 text-teal-100" />
              ) : (
                <Smartphone className="h-5 w-5 text-teal-100" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">
                {installed ? t("pwaInstalledBadge") : t("pwaInstallBadge")}
              </p>
              <p className="text-sm font-semibold text-teal-50">{installLabel}</p>
              <p className="mt-0.5 text-xs leading-snug text-teal-200/70">{installHint}</p>
            </div>
            {canInstall && !installed && (
              <Download className="h-5 w-5 shrink-0 text-teal-200 transition-transform group-hover:translate-y-0.5" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
