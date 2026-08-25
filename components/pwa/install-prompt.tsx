"use client";

import { useState } from "react";
import { Download, Share, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import { useIsMobile } from "@/lib/pwa/display-mode";
import {
  isPwaInstallDismissed,
  markPwaInstallDismissed,
} from "@/lib/pwa/install-storage";
import { usePwaInstall } from "@/lib/pwa/use-pwa-install";
import { MOBILE_TAB_BAR_HEIGHT } from "@/components/layout/mobile-tab-bar";
import { IosAddToHomeScreenGuide } from "@/components/pwa/ios-add-to-home-screen-guide";
import { Modal } from "@/components/ui/modal";

const APP_ROUTE_PREFIXES = [
  "/admin",
  "/academic",
  "/teacher",
  "/finance",
  "/operations",
  "/parent",
  "/student",
  "/analytics",
  "/messages",
  "/settings",
  "/notifications",
  "/outreach",
  "/pending",
];

function isAppRoute(pathname: string) {
  return APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isOnboardingRoute(pathname: string) {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

export function InstallPrompt() {
  const t = useTranslations("pwa");
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { canInstall, ios, installed, ready, install } = usePwaInstall();
  const [userDismissed, setUserDismissed] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const visible =
    ready &&
    !installed &&
    !userDismissed &&
    !isAppRoute(pathname) &&
    !isOnboardingRoute(pathname) &&
    !isPwaInstallDismissed() &&
    (ios || canInstall);

  function dismiss() {
    markPwaInstallDismissed();
    setUserDismissed(true);
    setGuideOpen(false);
  }

  async function handleInstall() {
    const accepted = await install();
    setGuideOpen(false);
    if (!accepted) {
      markPwaInstallDismissed();
      setUserDismissed(true);
    }
  }

  if (!visible && !guideOpen) return null;

  const bottomOffset =
    isMobile && isAppRoute(pathname)
      ? `calc(${MOBILE_TAB_BAR_HEIGHT} + env(safe-area-inset-bottom) + 0.75rem)`
      : "calc(env(safe-area-inset-bottom) + 1rem)";

  return (
    <>
      {visible ? (
        <div
          className="fixed inset-x-4 z-[100] mx-auto max-w-lg rounded-2xl border border-primary-200 bg-white p-4 shadow-2xl shadow-primary/10 dark:border-primary-900 dark:bg-stone-900"
          style={{ bottom: bottomOffset }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Download className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-stone-900 dark:text-white">
                {t("installProduct", { productName: companyIdentity.productName })}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                {ios ? t("iosInstallHint") : t("androidInstallHint")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!ios && canInstall && (
                  <button
                    type="button"
                    onClick={() => void handleInstall()}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary"
                  >
                    <Download className="h-4 w-4" />
                    {t("installApp")}
                  </button>
                )}
                {ios && (
                  <button
                    type="button"
                    onClick={() => setGuideOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary"
                  >
                    <Share className="h-4 w-4" />
                    {t("iosGuide.showHow")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  {t("installLater")}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              aria-label={t("dismissInstallPrompt")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <Modal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={t("iosGuide.title", { productName: companyIdentity.productName })}
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
