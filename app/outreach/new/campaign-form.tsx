"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCampaign, sendCampaign } from "@/lib/actions/campaigns";

interface Props {
  schoolId: string;
}

export function CampaignForm({ schoolId }: Props) {
  const t = useTranslations("outreach");
  const te = useTranslations("errors");
  const tc = useTranslations("common");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [targetType, setTargetType] = useState("all_parents");
  const [classId, setClassId] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [loading, setLoading] = useState(false);

  const channelOptions = [
    { id: "whatsapp", label: t("channelWhatsappLabel"), description: t("channelWhatsappDesc") },
    { id: "in_app", label: t("channelInAppLabel"), description: t("channelInAppDesc") },
  ];

  const targetOptions = [
    { id: "all_parents", label: t("targetAllParents"), description: t("targetAllParentsDesc") },
    { id: "class", label: t("targetClass"), description: t("targetClassDesc") },
  ];

  const variableHints = [
    { var: "{guardian_name}" },
    { var: "{student_name}" },
    { var: "{amount}" },
    { var: "{due_date}" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId) {
      toast.error(te("noSchoolAssociated"));
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast.error(te("titleAndMessageRequired"));
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
        toast.error(typeof result.error === "string" ? result.error : t("failedCreateCampaign"));
        return;
      }

      const campaignId = result.data!.id;

      if (sendNow) {
        toast.loading(t("sendingMessages"), { id: "sending" });
        const sendResult = await sendCampaign(campaignId);
        toast.dismiss("sending");

        if (sendResult.error) {
          toast.error(sendResult.error);
        } else {
          toast.success(
            sendResult.failed
              ? t("sentToRecipientsWithFailed", {
                  sent: sendResult.sent,
                  failed: sendResult.failed,
                })
              : t("sentToRecipients", { sent: sendResult.sent })
          );
        }
      } else {
        toast.success(t("campaignSavedDraft"));
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
        <Label>{t("deliveryChannel")}</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {channelOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setChannel(opt.id)}
              className={`flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                channel === opt.id
                  ? "border-primary-500 bg-primary-light dark:bg-primary-light/40"
                  : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900"
              }`}
            >
              <span className="text-sm font-semibold text-stone-900 dark:text-white">{opt.label}</span>
              <span className="text-xs text-stone-500">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("recipientTarget")}</Label>
        <div className="flex gap-3">
          {targetOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTargetType(opt.id)}
              className={`flex-1 rounded-lg border-2 p-3 text-left transition-all ${
                targetType === opt.id
                  ? "border-primary-500 bg-primary-light dark:bg-primary-light/40"
                  : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
              }`}
            >
              <p className="text-sm font-semibold text-stone-900 dark:text-white">{opt.label}</p>
              <p className="text-xs text-stone-500">{opt.description}</p>
            </button>
          ))}
        </div>
        {targetType === "class" && (
          <Input
            placeholder={t("enterClassId")}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title" required>{t("campaignTitle")}</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="body" required>{t("message")}</Label>
          <span className={`text-xs ${charCount > whatsappLimit * 0.9 ? "text-red-500" : "text-stone-400"}`}>
            {charCount} / {whatsappLimit}
          </span>
        </div>
        <textarea
          id="body"
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-white"
        />
        <div className="flex flex-wrap gap-2">
          {variableHints.map((v) => (
            <button
              key={v.var}
              type="button"
              onClick={() => setBody((b) => b + v.var)}
              className="rounded-md bg-stone-100 px-2 py-1 text-xs font-mono dark:bg-stone-800"
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
        <label htmlFor="send-now" className="text-sm">{t("sendImmediately")}</label>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="ghost" onClick={() => router.push("/outreach")} disabled={loading}>
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t("sending") : sendNow ? t("sendCampaign") : t("saveAsDraft")}
        </Button>
      </div>
    </form>
  );
}
