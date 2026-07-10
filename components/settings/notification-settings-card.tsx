"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellRing } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getNotificationPermission,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push/client";
import {
  getNotificationPreferences,
  getPushSubscriptionCount,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/actions/notification-preferences";
import { toast } from "@/lib/toast";

const DEFAULT_PREFS: NotificationPreferences = {
  push_enabled: true,
  class_reminders_enabled: true,
  class_reminder_minutes: 5,
};

type Props = {
  showClassReminders?: boolean;
};

export function NotificationSettingsCard({ showClassReminders = false }: Props) {
  const t = useTranslations("settings");
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPermission(getNotificationPermission());
    void Promise.all([getNotificationPreferences(), getPushSubscriptionCount()]).then(
      ([nextPrefs, count]) => {
        setPrefs(nextPrefs);
        setSubscribed(count > 0);
        setLoaded(true);
      }
    );
  }, []);

  async function enablePush() {
    if (!vapidPublicKey) {
      toast.error(t("pushNotConfigured"));
      return;
    }
    setBusy(true);
    try {
      const result = await subscribeToPush(vapidPublicKey);
      if (result.ok) {
        setPermission("granted");
        setSubscribed(true);
        startTransition(async () => {
          await updateNotificationPreferences({ push_enabled: true });
          setPrefs((p) => ({ ...p, push_enabled: true }));
        });
        toast.success(t("pushEnabled"));
      } else if (result.error === "denied") {
        setPermission("denied");
        toast.error(t("pushDenied"));
      } else if (result.error === "no_service_worker") {
        toast.error(t("pushNeedsInstall"));
      } else {
        toast.error(t("pushEnableFailed"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function disablePush() {
    setBusy(true);
    try {
      const result = await unsubscribeFromPush();
      if (!result.ok) {
        toast.error(t("pushDisableFailed"));
        return;
      }
      setSubscribed(false);
      startTransition(async () => {
        const res = await updateNotificationPreferences({ push_enabled: false });
        if (res.error) toast.error(res.error);
        else setPrefs((p) => ({ ...p, push_enabled: false }));
      });
      toast.success(t("pushDisabled"));
    } finally {
      setBusy(false);
    }
  }

  function savePrefs(patch: Partial<NotificationPreferences>) {
    const previous = prefs;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    startTransition(async () => {
      const res = await updateNotificationPreferences(patch);
      if (res.error) {
        toast.error(res.error);
        setPrefs(previous);
      } else {
        toast.success(t("prefsSaved"));
      }
    });
  }

  const pushReady = Boolean(vapidPublicKey) && isPushSupported();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notifications")}</CardTitle>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("notificationsDescription")}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {!loaded ? (
          <div className="h-16 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-white">
                  {t("pushAlerts")}
                </p>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  {!pushReady
                    ? t("pushNotSupported")
                    : permission === "denied"
                      ? t("pushDeniedHint")
                      : subscribed && permission === "granted"
                        ? t("pushActive")
                        : t("pushInactive")}
                </p>
              </div>
              {pushReady && permission !== "denied" && (
                <Button
                  type="button"
                  variant={subscribed && permission === "granted" ? "outline" : "primary"}
                  disabled={busy || pending}
                  onClick={() =>
                    void (subscribed && permission === "granted"
                      ? disablePush()
                      : enablePush())
                  }
                >
                  {subscribed && permission === "granted" ? (
                    <>
                      <Bell className="mr-2 h-4 w-4 opacity-60" />
                      {t("turnOffPush")}
                    </>
                  ) : (
                    <>
                      <BellRing className="mr-2 h-4 w-4" />
                      {busy ? t("pushEnabling") : t("turnOnPush")}
                    </>
                  )}
                </Button>
              )}
            </div>

            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-stone-700 dark:text-stone-300">
                {t("pushEnabledLabel")}
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary"
                checked={prefs.push_enabled}
                disabled={pending}
                onChange={(e) => savePrefs({ push_enabled: e.target.checked })}
              />
            </label>

            {showClassReminders && (
              <>
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    {t("classRemindersLabel")}
                  </span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary"
                    checked={prefs.class_reminders_enabled}
                    disabled={pending}
                    onChange={(e) =>
                      savePrefs({ class_reminders_enabled: e.target.checked })
                    }
                  />
                </label>

                <div>
                  <Label htmlFor="class_reminder_minutes">
                    {t("classReminderMinutes")}
                  </Label>
                  <select
                    id="class_reminder_minutes"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                    value={prefs.class_reminder_minutes}
                    disabled={pending || !prefs.class_reminders_enabled}
                    onChange={(e) =>
                      savePrefs({ class_reminder_minutes: Number(e.target.value) })
                    }
                  >
                    {[3, 5, 10, 15].map((m) => (
                      <option key={m} value={m}>
                        {t("minutesBefore", { count: m })}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    {t("classRemindersHint")}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
