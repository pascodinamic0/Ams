"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCampaign, sendCampaign } from "@/lib/actions/campaigns";

const CHANNEL_OPTIONS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Delivered directly to parents' WhatsApp",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
    color: "text-emerald-600",
    border: "border-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    id: "sms",
    label: "SMS",
    description: "Plain text SMS to all phone numbers",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    color: "text-blue-600",
    border: "border-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: "in_app",
    label: "In-App Alert",
    description: "Notification inside the parent portal",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    color: "text-indigo-600",
    border: "border-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
  },
];

const TARGET_OPTIONS = [
  { id: "all_parents", label: "All Parents", description: "Every guardian with a phone number" },
  { id: "class", label: "Specific Class", description: "Enter a class ID to target" },
];

const VARIABLE_HINTS = [
  { var: "{guardian_name}", desc: "Parent's full name" },
  { var: "{student_name}", desc: "Student's full name" },
  { var: "{amount}", desc: "Fee balance" },
  { var: "{due_date}", desc: "Invoice due date" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [targetType, setTargetType] = useState("all_parents");
  const [classId, setClassId] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [loading, setLoading] = useState(false);

  const SCHOOL_ID = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }

    const target = targetType === "all_parents" ? "all_parents" : `class:${classId}`;

    setLoading(true);
    try {
      const result = await createCampaign(SCHOOL_ID, {
        title: title.trim(),
        body: body.trim(),
        channel: channel as "whatsapp" | "sms" | "in_app",
        target,
      });

      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to create campaign");
        return;
      }

      const campaignId = result.data!.id;

      if (sendNow) {
        toast.loading("Sending messages...", { id: "sending" });
        const sendResult = await sendCampaign(campaignId);
        toast.dismiss("sending");

        if (sendResult.error) {
          toast.error(sendResult.error);
        } else {
          toast.success(
            `Sent to ${sendResult.sent} recipients${sendResult.failed ? ` (${sendResult.failed} failed)` : ""}`
          );
        }
      } else {
        toast.success("Campaign saved as draft");
      }

      router.push("/outreach");
    } finally {
      setLoading(false);
    }
  }

  const charCount = body.length;
  const whatsappLimit = 1600;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Campaign</h1>
        <p className="mt-1 text-sm text-slate-500">Compose a message and send it to parents via WhatsApp, SMS, or in-app notification.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Channel picker */}
        <div className="space-y-2">
          <Label>Delivery Channel</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CHANNEL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setChannel(opt.id)}
                className={`flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                  channel === opt.id
                    ? `${opt.border} ${opt.bg}`
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                }`}
              >
                <span className={channel === opt.id ? opt.color : "text-slate-400"}>{opt.icon}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                <span className="text-xs text-slate-500">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div className="space-y-2">
          <Label>Recipient Target</Label>
          <div className="flex gap-3">
            {TARGET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTargetType(opt.id)}
                className={`flex-1 rounded-lg border-2 p-3 text-left transition-all ${
                  targetType === opt.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.description}</p>
              </button>
            ))}
          </div>
          {targetType === "class" && (
            <div className="pt-1">
              <Input
                placeholder="Enter class ID (e.g. uuid of the class)"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Campaign title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" required>Campaign Title</Label>
          <Input
            id="title"
            placeholder="e.g. Term 2 Fee Reminder"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-xs text-slate-500">Internal reference only — not visible to recipients.</p>
        </div>

        {/* Message body */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="body" required>Message</Label>
            <span className={`text-xs ${charCount > whatsappLimit * 0.9 ? "text-red-500" : "text-slate-400"}`}>
              {charCount} / {whatsappLimit}
            </span>
          </div>
          <textarea
            id="body"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Dear {guardian_name}, this is a reminder that {student_name}'s fees are due. Please clear the balance at your earliest convenience."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
          {/* Variable hints */}
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">Available variables:</p>
            <div className="flex flex-wrap gap-2">
              {VARIABLE_HINTS.map((v) => (
                <button
                  key={v.var}
                  type="button"
                  title={v.desc}
                  onClick={() => setBody((b) => b + v.var)}
                  className="rounded-md bg-white px-2 py-1 text-xs font-mono font-medium text-indigo-700 shadow-sm ring-1 ring-slate-200 hover:bg-indigo-50 dark:bg-slate-700 dark:text-indigo-400 dark:ring-slate-600"
                >
                  {v.var}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        {body.trim() && (
          <div className="space-y-1.5">
            <Label>Preview</Label>
            <div className="rounded-xl border border-slate-200 bg-emerald-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">A</div>
                <div className="rounded-2xl rounded-tl-none bg-white px-4 py-2.5 shadow-sm dark:bg-slate-700">
                  <p className="text-sm text-slate-800 dark:text-slate-200" style={{ whiteSpace: "pre-wrap" }}>
                    {body
                      .replace(/\{guardian_name\}/g, "Mrs. Ama Asante")
                      .replace(/\{student_name\}/g, "Kwame Asante")
                      .replace(/\{amount\}/g, "250.00")
                      .replace(/\{currency\}/g, "GHS")
                      .replace(/\{due_date\}/g, "Mar 15, 2026")}
                  </p>
                  <p className="mt-1 text-right text-xs text-slate-400">Sample preview</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send options */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <input
            type="checkbox"
            id="send-now"
            checked={sendNow}
            onChange={(e) => setSendNow(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="send-now" className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">Send immediately</span> — uncheck to save as draft and send later
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/outreach")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : sendNow ? "Send Campaign" : "Save as Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
