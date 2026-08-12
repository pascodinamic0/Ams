"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { CameraCaptureModal } from "@/components/profile/camera-capture-modal";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { recordPayment } from "@/lib/actions/payments";
import { paymentSchema, type PaymentFormData } from "@/lib/validations/finance";
import { toast } from "@/lib/toast";

const PROOF_MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  schoolId?: string;
  openInvoices: {
    id: string;
    label: string;
    balance: number;
  }[];
}

export function PaymentForm({ schoolId, openInvoices }: Props) {
  const router = useRouter();
  const t = useTranslations("finance");
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(data: PaymentFormData) {
    const result = await recordPayment(data);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("paymentRecordFailed"));
      return;
    }
    toast.success(t("paymentRecorded"));
    setFormKey((key) => key + 1);
    router.refresh();
  }

  return (
    <FormWrapper
      key={formKey}
      schema={paymentSchema}
      defaultValues={{ method: "cash", proof_url: "" }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <PaymentFormFields schoolId={schoolId} openInvoices={openInvoices} />
    </FormWrapper>
  );
}

function PaymentFormFields({
  schoolId,
  openInvoices,
}: {
  schoolId?: string;
  openInvoices: { id: string; label: string; balance: number }[];
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const {
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useFormContext<PaymentFormData>();
  const proofUrl = useWatch({ name: "proof_url" }) ?? "";
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraUploading, setCameraUploading] = useState(false);

  const storagePath = schoolId ? `${schoolId}/payment-proofs` : null;

  async function uploadProof(file: File) {
    if (!storagePath) {
      toast.error(te("assignSchoolBeforeProof"));
      throw new Error(te("assignSchoolBeforeProof"));
    }
    if (file.size > PROOF_MAX_BYTES) {
      const tooLarge = t("fileTooLarge", { max: PROOF_MAX_BYTES / 1024 / 1024 });
      toast.error(tooLarge);
      throw new Error(tooLarge);
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const filePath = `${storagePath}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("school-assets").upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from("school-assets").getPublicUrl(filePath);
    setValue("proof_url", data.publicUrl, { shouldDirty: true, shouldValidate: true });
  }

  async function handleCameraCapture(file: File) {
    setCameraUploading(true);
    try {
      await uploadProof(file);
      toast.success(t("paymentProofUploaded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("uploadFailed"));
      throw err;
    } finally {
      setCameraUploading(false);
    }
  }

  return (
    <>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="invoice_id" required>{t("invoice")}</Label>
        <select
          id="invoice_id"
          {...register("invoice_id")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">{t("selectInvoice")}</option>
          {openInvoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {t("invoiceBalance", { label: inv.label, balance: inv.balance.toFixed(2) })}
            </option>
          ))}
        </select>
        {errors.invoice_id && <p className="mt-1 text-sm text-red-500">{errors.invoice_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="amount" required>{tc("amount")}</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} error={!!errors.amount} />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div>
        <Label htmlFor="method" required>{t("colMethod")}</Label>
        <select
          id="method"
          {...register("method")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="cash">{t("cash")}</option>
          <option value="bank_transfer">{t("bankTransfer")}</option>
          <option value="card">{t("card")}</option>
          <option value="mobile_money">{t("mobileMoney")}</option>
          <option value="other">{t("other")}</option>
        </select>
      </div>
      <div>
        <Label htmlFor="reference">{t("reference")}</Label>
        <Input id="reference" {...register("reference")} placeholder={t("receiptOrTransactionId")} />
      </div>
      <div>
        <Label htmlFor="paid_at">{t("paidAt")}</Label>
        <Input id="paid_at" type="datetime-local" {...register("paid_at")} />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="proof_url">{t("paymentProof")}</Label>
        <p className="mb-2 text-xs text-stone-500 dark:text-stone-400">
          {t("paymentProofHint")}
        </p>
        <input type="hidden" {...register("proof_url")} />
        {storagePath ? (
          <div className="space-y-2">
            <FileUpload
              bucket="school-assets"
              path={storagePath}
              accept="image/jpeg,image/png,image/gif,image/webp"
              maxSize={PROOF_MAX_BYTES}
              value={proofUrl || undefined}
              onUpload={(url) => {
                setValue("proof_url", url, { shouldDirty: true, shouldValidate: true });
                toast.success(t("paymentProofUploaded"));
              }}
              onRemove={() => setValue("proof_url", "", { shouldDirty: true, shouldValidate: true })}
              onError={(message) => toast.error(message)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={cameraUploading}
              onClick={() => setCameraOpen(true)}
            >
              <Camera className="mr-1.5 h-4 w-4" />
              {t("takePhoto")}
            </Button>
            <CameraCaptureModal
              isOpen={cameraOpen}
              onClose={() => setCameraOpen(false)}
              onCapture={handleCameraCapture}
              disabled={cameraUploading}
            />
          </div>
        ) : (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t("assignSchoolForProof")}
          </p>
        )}
        {errors.proof_url && <p className="mt-1 text-sm text-red-500">{errors.proof_url.message}</p>}
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {t("recordPayment")}
        </Button>
      </div>
    </>
  );
}
