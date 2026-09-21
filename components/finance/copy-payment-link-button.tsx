"use client";

import { useState } from "react";
import { Link2, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { ensureInvoicePaymentLink } from "@/lib/actions/payment-links";

type CopyPaymentLinkButtonProps = {
  invoiceId: string;
  payUrl?: string | null;
  studentName: string;
  amountLabel: string;
  dueDate: string;
  disabled?: boolean;
};

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyPaymentLinkButton({
  invoiceId,
  payUrl,
  studentName,
  amountLabel,
  dueDate,
  disabled,
}: CopyPaymentLinkButtonProps) {
  const t = useTranslations("finance");
  const te = useTranslations("errors");
  const [busy, setBusy] = useState<"link" | "message" | null>(null);

  async function resolveUrl(): Promise<string | null> {
    if (payUrl) return payUrl;
    const result = await ensureInvoicePaymentLink(invoiceId);
    if ("error" in result) {
      toast.error(result.error || te("invoiceNotFound"));
      return null;
    }
    return result.url;
  }

  async function copyLink() {
    setBusy("link");
    try {
      const url = await resolveUrl();
      if (!url) return;
      const ok = await writeClipboard(url);
      if (ok) toast.success(t("payLinkCopied"));
      else toast.error(te("somethingWentWrong"));
    } finally {
      setBusy(null);
    }
  }

  async function copyMessage() {
    setBusy("message");
    try {
      const url = await resolveUrl();
      if (!url) return;
      const message = t("payLinkWhatsAppMessage", {
        student: studentName,
        amount: amountLabel,
        date: dueDate,
        url,
      });
      const ok = await writeClipboard(message);
      if (ok) toast.success(t("payLinkMessageCopied"));
      else toast.error(te("somethingWentWrong"));
    } finally {
      setBusy(null);
    }
  }

  if (disabled) return null;

  return (
    <div className="flex flex-wrap items-center gap-1" data-tour="copy-pay-link">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={copyLink}
        disabled={busy !== null}
        title={t("copyPayLink")}
      >
        <Link2 className="mr-1 h-3.5 w-3.5" />
        {busy === "link" ? t("copyingPayLink") : t("copyPayLink")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={copyMessage}
        disabled={busy !== null}
        title={t("copyPayMessage")}
      >
        <MessageCircle className="mr-1 h-3.5 w-3.5" />
        {busy === "message" ? t("copyingPayLink") : t("copyPayMessage")}
      </Button>
    </div>
  );
}
