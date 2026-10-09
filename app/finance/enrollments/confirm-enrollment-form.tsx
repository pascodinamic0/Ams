"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { CameraCaptureModal } from "@/components/profile/camera-capture-modal";
import { confirmPendingEnrollment } from "@/lib/actions/enrollment-payments";
import { formatMoney } from "@/lib/currency";
import { toast } from "@/lib/toast";
import type { PendingEnrollmentRow } from "@/lib/db/pending-enrollments";

const PROOF_MAX_BYTES = 5 * 1024 * 1024;

export function ConfirmEnrollmentForm({
  row,
  schoolId,
  currencyCode,
}: {
  row: PendingEnrollmentRow;
  schoolId?: string;
  currencyCode: string;
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const router = useRouter();
  const [amount, setAmount] = useState(String(row.invoice_balance || row.invoice_amount));
  const [method, setMethod] = useState<
    "cash" | "bank_transfer" | "card" | "mobile_money" | "online" | "other"
  >("cash");
  const [reference, setReference] = useState(row.enrollment_receipt_ref ?? "");
  const [proofUrl, setProofUrl] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraUploading, setCameraUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fieldKey = row.student_id;
  const storagePath = schoolId ? `${schoolId}/payment-proofs` : null;
  const amountNum = Number(amount);
  const mismatch =
    Number.isFinite(amountNum) &&
    row.invoice_balance > 0 &&
    amountNum !== row.invoice_balance;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (row.invoices.length === 0) {
      toast.error(t("enrollmentInvoiceMissing"));
      return;
    }
    setSubmitting(true);
    const result = await confirmPendingEnrollment({
      student_id: row.student_id,
      amount: amountNum,
      method,
      reference: reference.trim() || undefined,
      proof_url: proofUrl.trim() || undefined,
    });
    setSubmitting(false);

    if ("error" in result && result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("enrollmentConfirmFailed"));
      return;
    }

    if ("data" in result && result.data?.student_activated) {
      toast.success(t("enrollmentActivated"));
    } else {
      toast.success(t("enrollmentPaymentRecorded"));
    }
    router.refresh();
  }

  if (row.invoices.length === 0) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300">
        {t("enrollmentInvoiceMissing")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-stone-500">{t("colStudent")}</p>
          <p className="font-medium">{row.student_name}</p>
          {row.student_number ? (
            <p className="text-xs text-stone-500">{row.student_number}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs text-stone-500">{t("enrollmentAmountDue")}</p>
          <p className="font-medium">{formatMoney(row.invoice_balance, currencyCode)}</p>
          {row.invoices.length > 0 ? (
            <p className="text-xs font-normal text-stone-500">
              {row.invoices
                .map((invoice) =>
                  [
                    invoice.fee_structure_name,
                    formatMoney(invoice.amount, currencyCode),
                  ]
                    .filter(Boolean)
                    .join(" ")
                )
                .join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`amount-${fieldKey}`}>{tc("amount")}</Label>
          <Input
            id={`amount-${fieldKey}`}
            type="number"
            min={0.01}
            step="0.01"
            max={row.invoice_balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          {mismatch ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {t("enrollmentAmountMismatch", {
                expected: formatMoney(row.invoice_balance, currencyCode),
              })}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`method-${fieldKey}`}>{t("colMethod")}</Label>
          <Select
            id={`method-${fieldKey}`}
            value={method}
            onChange={(e) =>
              setMethod(e.target.value as typeof method)
            }
            options={[
              { value: "cash", label: t("cash") },
              { value: "mobile_money", label: t("mobileMoney") },
              { value: "bank_transfer", label: t("bankTransfer") },
              { value: "card", label: t("card") },
              { value: "other", label: t("other") },
            ]}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`ref-${fieldKey}`}>{t("colReference")}</Label>
          <Input
            id={`ref-${fieldKey}`}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t("paperReceiptRefPlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("enrollmentProofRequiredLabel")}</Label>
        <p className="text-xs text-stone-500">{t("enrollmentProofHint")}</p>
        <div className="flex w-full flex-col items-start gap-2">
          {storagePath ? (
            <>
              <FileUpload
                bucket="school-assets"
                path={storagePath}
                accept="image/jpeg,image/png,image/gif,image/webp"
                maxSize={PROOF_MAX_BYTES}
                value={proofUrl || undefined}
                onUpload={(url) => {
                  setProofUrl(url);
                  toast.success(t("paymentProofUploaded"));
                }}
                onRemove={() => setProofUrl("")}
                onError={(message) => toast.error(message)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCameraOpen(true)}
                disabled={cameraUploading}
              >
                <Camera className="mr-1 h-4 w-4" />
                {t("takePhoto")}
              </Button>
            </>
          ) : null}
          {proofUrl ? (
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              {t("viewProof")}
            </a>
          ) : null}
        </div>
        <CameraCaptureModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={async (file) => {
            if (!storagePath) return;
            if (file.size > PROOF_MAX_BYTES) {
              toast.error(t("proofTooLarge"));
              return;
            }
            setCameraUploading(true);
            try {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              const ext = file.name.split(".").pop() ?? "jpg";
              const filePath = `${storagePath}/${Date.now()}.${ext}`;
              const { error } = await supabase.storage
                .from("school-assets")
                .upload(filePath, file);
              if (error) throw error;
              const { data } = supabase.storage
                .from("school-assets")
                .getPublicUrl(filePath);
              setProofUrl(data.publicUrl);
              toast.success(t("paymentProofUploaded"));
            } catch {
              toast.error(t("proofUploadFailed"));
            } finally {
              setCameraUploading(false);
            }
          }}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? tc("saving") : t("confirmEnrollmentPayment")}
      </Button>
    </form>
  );
}
