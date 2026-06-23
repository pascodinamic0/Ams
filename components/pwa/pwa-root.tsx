"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { saveAttendance } from "@/lib/actions/attendance";
import {
  getPendingAttendanceCount,
  getPendingAttendanceSaves,
  removePendingAttendanceSave,
} from "@/lib/pwa/attendance-offline";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { SerwistProvider } from "@/components/pwa/serwist-provider";

async function syncPendingAttendance() {
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

    if (result.error) continue;
    await removePendingAttendanceSave(entry.id);
    synced += 1;
  }

  if (synced > 0) {
    toast.success(
      synced === 1
        ? "Offline attendance synced"
        : `${synced} offline attendance records synced`
    );
  }
}

function OfflineSyncManager() {
  useEffect(() => {
    if (!navigator.onLine) return;

    void syncPendingAttendance();

    async function handleOnline() {
      await syncPendingAttendance();
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    void getPendingAttendanceCount().then((count) => {
      if (count > 0 && navigator.onLine) {
        toast.message(`${count} attendance record(s) waiting to sync`);
      }
    });
  }, []);

  return null;
}

export function PwaRoot({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider>
      {children}
      <OfflineBanner />
      <InstallPrompt />
      <OfflineSyncManager />
    </SerwistProvider>
  );
}
