"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { saveAttendance } from "@/lib/actions/attendance";
import {
  getPendingAttendanceCount,
  getPendingAttendanceSaves,
  removePendingAttendanceSave,
} from "@/lib/pwa/attendance-offline";
import { AutoRefreshProvider } from "@/components/layout/auto-refresh-provider";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { MobileSplashScreen } from "@/components/pwa/mobile-splash-screen";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { PushPermissionPrompt } from "@/components/pwa/push-permission-prompt";
import { SerwistProvider } from "@/components/pwa/serwist-provider";

async function syncPendingAttendance(t: (key: string, values?: Record<string, number>) => string) {
  const pending = await getPendingAttendanceSaves();
  if (pending.length === 0) return;

  let synced = 0;

  for (const entry of pending) {
    const result = await saveAttendance({
      class_id: entry.class_id,
      date: entry.date,
      period: entry.period,
      records: entry.records,
    });

    if ("error" in result && result.error) continue;
    await removePendingAttendanceSave(entry.id);
    synced += 1;
  }

  if (synced > 0) {
    toast.success(
      synced === 1
        ? t("offlineAttendanceSynced")
        : t("offlineAttendanceSyncedCount", { count: synced })
    );
  }
}

function OfflineSyncManager() {
  const t = useTranslations("pwa");

  useEffect(() => {
    // Defer offline sync until after first paint so it doesn't compete with hydration.
    const run = () => {
      if (!navigator.onLine) return;
      void syncPendingAttendance(t);
      void getPendingAttendanceCount().then((count) => {
        if (count > 0 && navigator.onLine) {
          toast.message(t("attendanceWaitingToSync", { count }));
        }
      });
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | undefined;
    let timeoutId: number | undefined;

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(run, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(run, 800);
    }

    async function handleOnline() {
      await syncPendingAttendance(t);
    }

    window.addEventListener("online", handleOnline);
    return () => {
      if (idleId !== undefined) {
        win.cancelIdleCallback?.(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("online", handleOnline);
    };
  }, [t]);

  return null;
}

export function PwaRoot({ children }: { children: React.ReactNode }) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;

  return (
    <SerwistProvider>
      <AutoRefreshProvider />
      <MobileSplashScreen />
      {children}
      <OfflineBanner />
      <InstallPrompt />
      <PushPermissionPrompt vapidPublicKey={vapidPublicKey} />
      <OfflineSyncManager />
    </SerwistProvider>
  );
}
