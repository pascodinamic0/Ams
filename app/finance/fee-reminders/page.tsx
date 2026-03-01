import { FeeReminderSettingsForm } from "./fee-reminder-settings-form";
import { getFeeReminderSettings } from "@/lib/db/campaigns";
import { createClient } from "@/lib/supabase/server";

export default async function FeeRemindersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let schoolId = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single();
    schoolId = profile?.school_id ?? "";
  }

  const settings = schoolId ? await getFeeReminderSettings(schoolId) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Reminder Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure automatic WhatsApp reminders for overdue fee payments. The system runs nightly and sends messages based on these rules.
        </p>
      </div>

      {/* Status card */}
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${settings?.enabled ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"}`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${settings?.enabled ? "bg-green-100 dark:bg-green-900/40" : "bg-slate-200 dark:bg-slate-700"}`}>
          <svg className={`h-5 w-5 ${settings?.enabled ? "text-green-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <p className={`text-sm font-semibold ${settings?.enabled ? "text-green-800 dark:text-green-300" : "text-slate-600 dark:text-slate-400"}`}>
            {settings?.enabled ? "Reminders are active" : settings ? "Reminders are disabled" : "Not configured yet"}
          </p>
          <p className="text-xs text-slate-500">
            {settings?.enabled
              ? `Grace period: ${settings.grace_period_days} days · Runs nightly via /api/cron/fee-reminders`
              : "Save settings below to activate"}
          </p>
        </div>
      </div>

      <FeeReminderSettingsForm schoolId={schoolId} initialSettings={settings} />
    </div>
  );
}
