"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCampaign, sendCampaign } from "@/lib/actions/campaigns";

const CHANNEL_OPTIONS = [
  { id: "whatsapp", label: "WhatsApp", description: "Delivered directly to parents' WhatsApp" },
  { id: "in_app", label: "In-App Alert", description: "Notification inside the parent portal" },
];

const TARGET_OPTIONS = [
  { id: "all_parents", label: "All Parents", description: "Every guardian in the school" },
  { id: "class", label: "Specific Class", description: "Enter a class ID to target" },
];

const VARIABLE_HINTS = [
  { var: "{guardian_name}", desc: "Parent's full name" },
  { var: "{student_name}", desc: "Student's full name" },
  { var: "{amount}", desc: "Fee balance" },
  { var: "{due_date}", desc: "Invoice due date" },
];

interface Props {
  schoolId: string;
}

export function CampaignForm({ schoolId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [targetType, setTargetType] = useState("all_parents");
  const [classId, setClassId] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId) {
      toast.error("No school associated with your account");
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }

    const target = targetType === "all_parents" ? "all_parents" : `class:${classId}`;

    setLoading(true);
    try {
      const result = await createCampaign(schoolId, {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Delivery Channel</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CHANNEL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setChannel(opt.id)}
              className={`flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                channel === opt.id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</span>
              <span className="text-xs text-slate-500">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

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
          <Input
            placeholder="Enter class ID"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title" required>Campaign Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

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
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <div className="flex flex-wrap gap-2">
          {VARIABLE_HINTS.map((v) => (
            <button
              key={v.var}
              type="button"
              onClick={() => setBody((b) => b + v.var)}
              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-mono dark:bg-slate-800"
            >
              {v.var}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="send-now"
          checked={sendNow}
          onChange={(e) => setSendNow(e.target.checked)}
          className="h-4 w-4 rounded"
        />
        <label htmlFor="send-now" className="text-sm">Send immediately</label>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="ghost" onClick={() => router.push("/outreach")} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : sendNow ? "Send Campaign" : "Save as Draft"}
        </Button>
      </div>
    </form>
  );
}
