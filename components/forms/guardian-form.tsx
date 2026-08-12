"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createGuardian } from "@/lib/actions/guardians";
import { guardianSchema, type GuardianFormData } from "@/lib/validations";
import { toast } from "@/lib/toast";

export function GuardianForm({ schoolId }: { schoolId: string }) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: GuardianFormData) {
    setLoading(true);
    try {
      const result = await createGuardian({ ...data, school_id: schoolId });
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : t("failedCreateGuardian"));
        return;
      }
      toast.success(t("guardianCreated"));
      router.push("/academic/guardians");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormWrapper schema={guardianSchema} defaultValues={{ relation: "guardian", first_name: "", middle_name: "", last_name: "" }} onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("guardianDetails")}</CardTitle>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("guardianDetailsDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <GuardianFormFields />
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => router.push("/academic/guardians")}
          >
            {tc("cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? tc("creating") : t("createGuardian")}
          </Button>
        </CardFooter>
      </Card>
    </FormWrapper>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-stone-500 dark:text-stone-400">{hint}</p>
      )}
    </div>
  );
}

function GuardianFormFields() {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const { register, formState: { errors } } = useFormContext<GuardianFormData>();

  return (
    <>
      <FormSection title={t("contactInformation")} description={t("contactInformationDesc")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("firstName")} htmlFor="first_name" required error={errors.first_name?.message}>
            <Input id="first_name" {...register("first_name")} error={!!errors.first_name} />
          </Field>
          <Field label={t("middleName")} htmlFor="middle_name" error={errors.middle_name?.message}>
            <Input id="middle_name" {...register("middle_name")} error={!!errors.middle_name} />
          </Field>
          <Field label={t("lastName")} htmlFor="last_name" required error={errors.last_name?.message}>
            <Input id="last_name" {...register("last_name")} error={!!errors.last_name} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={tc("email")} htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} error={!!errors.email} />
          </Field>
          <Field
            label={tc("phone")}
            htmlFor="phone"
            hint={t("phoneHintSms")}
          >
            <Input id="phone" type="tel" {...register("phone")} />
          </Field>
        </div>
      </FormSection>

      <div className="border-t border-stone-200 dark:border-stone-800" />

      <FormSection title={t("relationshipSection")} description={t("relationshipSectionDesc")}>
        <Field label={t("relationToStudent")} htmlFor="relation" error={errors.relation?.message}>
          <Select
            id="relation"
            options={[
              { value: "father", label: t("relationFather") },
              { value: "mother", label: t("relationMother") },
              { value: "guardian", label: t("relationGuardian") },
              { value: "other", label: t("relationOther") },
            ]}
            error={!!errors.relation}
            {...register("relation")}
          />
        </Field>
      </FormSection>
    </>
  );
}
