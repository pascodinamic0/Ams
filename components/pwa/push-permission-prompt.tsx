"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MOBILE_TAB_BAR_HEIGHT } from "@/components/layout/mobile-tab-bar";
import { useIsMobile } from "@/lib/pwa/display-mode";
import {
  getNotificationPermission,
  isPushSupported,
  subscribeToPush,
} from "@/lib/push/client";

const DISMISS_KEY = "shuleos-push-prompt-dismissed";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

const TEACHER_PREFIXES = ["/teacher"];

function isTeacherRoute(pathname: string) {
  return TEACHER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

type Props = {
  vapidPublicKey: string | null;
};

export function PushPermissionPrompt({ vapidPublicKey }: Props) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const t = useTranslations("pwa");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!vapidPublicKey) return;
    if (!isTeacherRoute(pathname)) return;
    if (!isPushSupported()) return;
    if (getNotificationPermission() === "granted") return;
    if (getNotificationPermission() === "denied") return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_MS) {
      return;
    }

    setVisible(true);
  }, [pathname, vapidPublicKey]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function enable() {
    if (!vapidPublicKey) return;
    setBusy(true);
    try {
      const result = await subscribeToPush(vapidPublicKey);
      if (result.ok) {
        localStorage.removeItem(DISMISS_KEY);
        setVisible(false);
      } else if (result.permission === "denied") {
        setVisible(false);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!visible || !vapidPublicKey) return null;

  const bottomOffset = isMobile
    ? `calc(${MOBILE_TAB_BAR_HEIGHT} + env(safe-area-inset-bottom) + 0.75rem)`
    : "calc(env(safe-area-inset-bottom) + 1rem)";

  return (
    <div
      className="fixed inset-x-4 z-[100] mx-auto max-w-lg rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl shadow-amber-900/10 dark:border-amber-900/50 dark:bg-stone-900"
      style={{ bottom: bottomOffset }}
      role="dialog"
      aria-labelledby="push-prompt-title"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            id="push-prompt-title"
            className="text-sm font-bold text-stone-900 dark:text-white"
          >
            {t("pushPromptTitle")}
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {t("pushPromptDescription")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void enable()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              <Bell className="h-4 w-4" />
              {busy ? t("pushEnabling") : t("pushEnable")}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <BellOff className="h-4 w-4" />
              {t("pushLater")}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label={t("pushLater")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
