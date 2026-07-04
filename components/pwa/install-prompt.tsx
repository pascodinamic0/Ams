"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { companyIdentity } from "@/lib/company/identity";
import { isStandaloneMode, useIsMobile } from "@/lib/pwa/display-mode";
import { MOBILE_TAB_BAR_HEIGHT } from "@/components/layout/mobile-tab-bar";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "shuleos-pwa-install-dismissed";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

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

function isIosDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isAppRoute(pathname: string) {
  return APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function InstallPrompt() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) return;
    if (isAppRoute(pathname)) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_MS) {
      return;
    }

    if (isIosDevice()) {
      setShowIosHelp(true);
      setVisible(true);
      return;
    }

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, [pathname]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setDeferredPrompt(null);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome !== "accepted") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  }

  if (!visible) return null;

  const bottomOffset = isMobile && isAppRoute(pathname)
    ? `calc(${MOBILE_TAB_BAR_HEIGHT} + env(safe-area-inset-bottom) + 0.75rem)`
    : "calc(env(safe-area-inset-bottom) + 1rem)";

  return (
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
            Install {companyIdentity.productName}
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {showIosHelp
              ? "Add to your home screen for quick access. Tap Share, then Add to Home Screen."
              : "Install the app on this device for faster access, full-screen mode, and offline support."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!showIosHelp && deferredPrompt && (
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary"
              >
                <Download className="h-4 w-4" />
                Install app
              </button>
            )}
            {showIosHelp && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-primary-light px-3 py-2 text-xs font-semibold text-primary-hover dark:bg-primary-light/50 dark:text-primary">
                <Share className="h-4 w-4" />
                Share, then Add to Home Screen
              </span>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
