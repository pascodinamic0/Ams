"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveReminderSettings } from "@/lib/actions/fee-reminders";
import type { FeeReminderSettings } from "@/lib/db/campaigns";

interface Props {
  schoolId: string;
  initialSettings: FeeReminderSettings | null;
}

const DEFAULT_MORNING = "Dear {guardian_name}, this is a reminder that {student_name}'s school fees of {currency}{amount} are due on {due_date}. Kindly make payment to avoid disruption.";
const DEFAULT_FINAL = "Dear {guardian_name}, your payment grace period has ended. Please do not bring {student_name} to school until the outstanding balance of {currency}{amount} is cleared. Contact the school office for assistance.";

export function FeeReminderSettingsForm({ schoolId, initialSettings }: Props) {
  const s = initialSettings;
  const [enabled, setEnabled] = useState(s?.enabled ?? true);
  const [gracePeriod, setGracePeriod] = useState(String(s?.grace_period_days ?? 7));
  const [remindDaysBefore, setRemindDaysBefore] = useState(
    (s?.remind_days_before ?? [3, 1]).join(", ")
  );
  const [remindOnDue, setRemindOnDue] = useState(s?.remind_on_due_day ?? true);
  const [remindOnExpiry, setRemindOnExpiry] = useState(s?.remind_on_grace_expiry ?? true);
  const [morningTemplate, setMorningTemplate] = useState(s?.morning_message_template ?? DEFAULT_MORNING);
  const [finalTemplate, setFinalTemplate] = useState(s?.final_warning_template ?? DEFAULT_FINAL);
  const [currency, setCurrency] = useState(s?.currency_symbol ?? "GHS");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const daysBefore = remindDaysBefore
      .split(",")
      .map((d) => parseInt(d.trim(), 10))
      .filter((d) => !isNaN(d) && d > 0);

    const graceDays = parseInt(gracePeriod, 10);
    if (isNaN(graceDays) || graceDays < 0) {
      toast.error("Grace period must be a valid number of days");
      return;
    }

    setSaving(true);
    try {
      const result = await saveReminderSettings(schoolId, {
        grace_period_days: graceDays,
        remind_days_before: daysBefore,
        remind_on_due_day: remindOnDue,
        remind_on_grace_expiry: remindOnExpiry,
        morning_message_template: morningTemplate,
        final_warning_template: finalTemplate,
        currency_symbol: currency,
        enabled,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Reminder settings saved");
      }
    } finally {
      setSaving(false);
    }
  }

  const TEMPLATE_VARS = [
    { var: "{guardian_name}", desc: "Parent's name" },
    { var: "{student_name}", desc: "Student's name" },
    { var: "{amount}", desc: "Balance owed" },
    { var: "{currency}", desc: "Currency symbol" },
    { var: "{due_date}", desc: "Original due date" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-7">
      {/* Enable toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Enable Automatic Reminders</p>
          <p className="text-sm text-slate-500">When disabled, no WhatsApp messages will be sent by the cron job.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>

      {/* Timing section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Timing Rules</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="grace-period">Grace Period (days after due date)</Label>
            <Input
              id="grace-period"
              type="number"
              min="0"
              max="365"
              value={gracePeriod}
              onChange={(e) => setGracePeriod(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              After this many days, the final warning is sent and student may be barred.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency Symbol</Label>
            <Input
              id="currency"
              placeholder="GHS, $, NGN..."
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="days-before">Remind X days before due date</Label>
          <Input
            id="days-before"
            placeholder="3, 1"
            value={remindDaysBefore}
            onChange={(e) => setRemindDaysBefore(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            Comma-separated list. E.g. "3, 1" sends a reminder 3 days before and 1 day before due date.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              id: "remind-on-due",
              label: "Send reminder on the due date itself",
              checked: remindOnDue,
              setter: setRemindOnDue,
            },
            {
              id: "remind-on-expiry",
              label: "Send final warning when grace period expires",
              sub: "This is the 'do not bring student to school' message",
              checked: remindOnExpiry,
              setter: setRemindOnExpiry,
            },
          ].map((opt) => (
            <label key={opt.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                id={opt.id}
                checked={opt.checked}
                onChange={(e) => opt.setter(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt.label}</p>
                {opt.sub && <p className="text-xs text-slate-500">{opt.sub}</p>}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Message templates */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 space-y-5">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Message Templates</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEMPLATE_VARS.map((v) => (
              <span
                key={v.var}
                title={v.desc}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-indigo-700 dark:bg-slate-700 dark:text-indigo-400"
              >
                {v.var}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="morning-template">Standard Reminder Message</Label>
          <textarea
            id="morning-template"
            rows={4}
            value={morningTemplate}
            onChange={(e) => setMorningTemplate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <p className="text-xs text-slate-500">Used for reminders before or on the due date.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="final-template">
            <span className="text-red-600">⚠</span> Final Warning Message (after grace period)
          </Label>
          <textarea
            id="final-template"
            rows={5}
            value={finalTemplate}
            onChange={(e) => setFinalTemplate(e.target.value)}
            className="w-full rounded-lg border border-red-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-800 dark:bg-slate-900 dark:text-white"
          />
          <p className="text-xs text-slate-500">
            Sent when grace period expires. Should clearly state the student should not come to school.
          </p>
        </div>

        {/* Preview */}
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-slate-800/60">
          <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">Final warning preview:</p>
          <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">A</div>
            <div className="rounded-2xl rounded-tl-none bg-white px-4 py-2.5 shadow-sm dark:bg-slate-700 max-w-sm">
              <p className="text-sm text-slate-800 dark:text-slate-200" style={{ whiteSpace: "pre-wrap" }}>
                {finalTemplate
                  .replace(/\{guardian_name\}/g, "Mrs. Ama Asante")
                  .replace(/\{student_name\}/g, "Kwame Asante")
                  .replace(/\{amount\}/g, "250.00")
                  .replace(/\{currency\}/g, currency || "GHS")
                  .replace(/\{due_date\}/g, "Mar 1, 2026")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving || !schoolId}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
