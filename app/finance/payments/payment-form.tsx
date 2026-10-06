"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
const SUGGESTION_LIMIT = 8;

export type OpenInvoiceOption = {
  id: string;
  label: string;
  balance: number;
  studentName: string;
  studentId: string;
  dueDate: string;
};

function foldSearch(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function invoiceSearchRank(invoice: OpenInvoiceOption, term: string) {
  const name = foldSearch(invoice.studentName);
  const id = foldSearch(invoice.studentId);
  if (name.startsWith(term) || id.startsWith(term)) return 0;
  if (name.split(/\s+/).some((part) => part.startsWith(term))) return 1;
  if (id.includes(term)) return 2;
  return 3;
}

function foldedIndexMap(text: string) {
  let folded = "";
  const start: number[] = [];
  const end: number[] = [];
  let index = 0;
  for (const char of text) {
    const plain = foldSearch(char);
    for (let piece = 0; piece < plain.length; piece += 1) {
      start.push(index);
      end.push(index + char.length);
    }
    folded += plain;
    index += char.length;
  }
  return { folded, start, end };
}

function HighlightMatch({ text, term }: { text: string; term: string }) {
  const needle = foldSearch(term.trim());
  if (!needle) return text;
  const { folded, start, end } = foldedIndexMap(text);
  const index = folded.indexOf(needle);
  if (index < 0 || start[index] === undefined || end[index + needle.length - 1] === undefined) {
    return text;
  }
  const from = start[index];
  const to = end[index + needle.length - 1];
  return (
    <>
      {text.slice(0, from)}
      <span className="font-semibold text-foreground">{text.slice(from, to)}</span>
      {text.slice(to)}
    </>
  );
}

interface Props {
  schoolId?: string;
  openInvoices: OpenInvoiceOption[];
}

export function PaymentForm({ schoolId, openInvoices }: Props) {
  const router = useRouter();
  const t = useTranslations("finance");
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(data: PaymentFormData) {
    const result = await recordPayment(data);
    if ("error" in result && result.error) {
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
  openInvoices: OpenInvoiceOption[];
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
  const selectedInvoiceId = useWatch({ name: "invoice_id" }) ?? "";
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraUploading, setCameraUploading] = useState(false);
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const suggestRootRef = useRef<HTMLDivElement>(null);
  const activeOptionRef = useRef<HTMLButtonElement>(null);

  function invoiceText(invoice: OpenInvoiceOption) {
    return t("invoiceBalance", {
      label: invoice.label,
      balance: invoice.balance.toFixed(2),
    });
  }

  const invoiceTerm = foldSearch(invoiceQuery.trim());
  const matchedInvoices = useMemo(() => {
    const pool = invoiceTerm
      ? openInvoices.filter((invoice) => {
          const name = foldSearch(invoice.studentName);
          const id = foldSearch(invoice.studentId);
          return name.includes(invoiceTerm) || id.includes(invoiceTerm);
        })
      : openInvoices;
    return [...pool].sort((a, b) => {
      if (invoiceTerm) {
        const rank = invoiceSearchRank(a, invoiceTerm) - invoiceSearchRank(b, invoiceTerm);
        if (rank !== 0) return rank;
      }
      const byName = a.studentName.localeCompare(b.studentName);
      if (byName !== 0) return byName;
      return a.label.localeCompare(b.label);
    });
  }, [invoiceTerm, openInvoices]);
  const visibleInvoices = matchedInvoices.slice(0, SUGGESTION_LIMIT);
  const hiddenInvoiceCount = Math.max(0, matchedInvoices.length - visibleInvoices.length);

  useEffect(() => {
    if (!suggestionsOpen) return;
    function handlePointer(event: MouseEvent) {
      if (!suggestRootRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [suggestionsOpen]);

  useEffect(() => {
    activeOptionRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, suggestionsOpen, invoiceTerm]);

  function selectInvoice(invoice: OpenInvoiceOption) {
    setValue("invoice_id", invoice.id, { shouldValidate: true, shouldDirty: true });
    setInvoiceQuery(invoiceText(invoice));
    setSuggestionsOpen(false);
  }

  function onInvoiceQueryChange(value: string) {
    setInvoiceQuery(value);
    setActiveIndex(0);
    setSuggestionsOpen(true);
    const selected = openInvoices.find((invoice) => invoice.id === selectedInvoiceId);
    if (!selected || invoiceText(selected) !== value) {
      setValue("invoice_id", "", { shouldValidate: false, shouldDirty: true });
    }
  }

  function onInvoiceQueryKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      return;
    }
    if (!suggestionsOpen || visibleInvoices.length === 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSuggestionsOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, visibleInvoices.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && visibleInvoices[activeIndex]) {
      event.preventDefault();
      selectInvoice(visibleInvoices[activeIndex]);
    }
  }

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
      <div ref={suggestRootRef} className="relative sm:col-span-2 lg:col-span-3">
        <Label htmlFor="invoice_search" required>{t("invoice")}</Label>
        <input type="hidden" {...register("invoice_id")} />
        <div className="relative mt-1">
          <Input
            id="invoice_search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen}
            aria-controls="invoice_search_list"
            aria-activedescendant={
              suggestionsOpen && visibleInvoices[activeIndex]
                ? `invoice_opt_${visibleInvoices[activeIndex].id}`
                : undefined
            }
            value={invoiceQuery}
            autoComplete="off"
            onChange={(event) => onInvoiceQueryChange(event.target.value)}
            onFocus={() => setSuggestionsOpen(true)}
            onKeyDown={onInvoiceQueryKeyDown}
            placeholder={t("searchOpenInvoices")}
            className={invoiceQuery ? "pr-9" : undefined}
          />
          {invoiceQuery ? (
            <button
              type="button"
              aria-label={t("clearStudentSearch")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              onClick={() => onInvoiceQueryChange("")}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
          {suggestionsOpen ? (
            <ul
              id="invoice_search_list"
              role="listbox"
              aria-label={t("searchOpenInvoices")}
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
            >
              {visibleInvoices.length === 0 ? (
                <li className="px-3 py-2 text-sm text-stone-500">{t("noOpenInvoicesMatch")}</li>
              ) : (
                visibleInvoices.map((invoice, index) => {
                  const active = index === activeIndex;
                  return (
                    <li key={invoice.id} role="presentation">
                      <button
                        id={`invoice_opt_${invoice.id}`}
                        ref={active ? activeOptionRef : undefined}
                        type="button"
                        role="option"
                        aria-selected={selectedInvoiceId === invoice.id}
                        className={`flex w-full flex-col px-3 py-2 text-left text-sm ${
                          active ? "bg-stone-100 dark:bg-stone-800" : "hover:bg-stone-50 dark:hover:bg-stone-900"
                        }`}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectInvoice(invoice)}
                      >
                        <span>
                          <HighlightMatch text={invoice.studentName} term={invoiceQuery} />
                        </span>
                        <span className="text-xs text-stone-500">
                          <HighlightMatch text={invoice.studentId} term={invoiceQuery} />
                          {" · "}
                          {t("invoiceDueBalance", {
                            due: invoice.dueDate,
                            balance: invoice.balance.toFixed(2),
                          })}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
              {hiddenInvoiceCount > 0 ? (
                <li className="px-3 py-2 text-xs text-stone-500">
                  {t("moreStudentMatches", { count: hiddenInvoiceCount })}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
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
