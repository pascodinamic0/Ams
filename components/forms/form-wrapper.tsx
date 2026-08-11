"use client";

import { useCallback, useRef, useState } from "react";
import {
  useForm,
  FormProvider,
  UseFormProps,
  FieldValues,
  FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";

interface FormWrapperProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues?: UseFormProps<T>["defaultValues"];
  onSubmit: (data: T) => void | Promise<void>;
  onInvalid?: (errors: FieldErrors<T>) => void;
  children: React.ReactNode;
  className?: string;
}

/** Stable JSON for comparing two form payloads (key order independent). */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`)
    .join(",")}}`;
}

export function FormWrapper<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onInvalid,
  children,
  className = "",
}: FormWrapperProps<T>) {
  const t = useTranslations("common");
  const methods = useForm<T>({
    // @ts-expect-error - Zod 4 / RHF resolver type mismatch
    resolver: zodResolver(schema),
    defaultValues,
  });

  const lastPayloadHashRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const pendingDuplicateRef = useRef<T | null>(null);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const runSubmit = useCallback(
    async (data: T) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await onSubmit(data);
        lastPayloadHashRef.current = stableStringify(data);
      } finally {
        inFlightRef.current = false;
      }
    },
    [onSubmit]
  );

  const handleValid = useCallback(
    async (data: T) => {
      if (inFlightRef.current) return;

      const hash = stableStringify(data);
      if (lastPayloadHashRef.current === hash) {
        pendingDuplicateRef.current = data;
        setDuplicateOpen(true);
        return;
      }

      await runSubmit(data);
    },
    [runSubmit]
  );

  const handleConfirmDuplicate = useCallback(async () => {
    const data = pendingDuplicateRef.current;
    pendingDuplicateRef.current = null;
    if (!data) return;
    await runSubmit(data);
  }, [runSubmit]);

  const handleCloseDuplicate = useCallback(() => {
    pendingDuplicateRef.current = null;
    setDuplicateOpen(false);
  }, []);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(
          handleValid as (data: FieldValues) => void,
          onInvalid as ((errors: FieldErrors<FieldValues>) => void) | undefined
        )}
        className={className}
        aria-busy={methods.formState.isSubmitting || undefined}
      >
        {children}
      </form>
      <Dialog
        isOpen={duplicateOpen}
        onClose={handleCloseDuplicate}
        title={t("duplicateSubmitTitle")}
        description={t("duplicateSubmitDescription")}
        confirmLabel={t("duplicateSubmitConfirm")}
        cancelLabel={t("cancel")}
        onConfirm={handleConfirmDuplicate}
      />
    </FormProvider>
  );
}
