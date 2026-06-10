"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: GuardianFormData) {
    setLoading(true);
    try {
      const result = await createGuardian({ ...data, school_id: schoolId });
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to create guardian");
        return;
      }
      toast.success("Guardian created");
      router.push("/academic/guardians");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormWrapper schema={guardianSchema} defaultValues={{ relation: "guardian" }} onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Guardian details</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Contact information and relationship to the student.
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
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create guardian"}
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
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
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
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function GuardianFormFields() {
  const { register, formState: { errors } } = useFormContext<GuardianFormData>();

  return (
    <>
      <FormSection title="Contact information" description="How the school can reach this guardian">
        <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" {...register("name")} error={!!errors.name} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} error={!!errors.email} />
          </Field>
          <Field
            label="Phone"
            htmlFor="phone"
            hint="Used for SMS and WhatsApp notifications"
          >
            <Input id="phone" type="tel" {...register("phone")} />
          </Field>
        </div>
      </FormSection>

      <div className="border-t border-slate-200 dark:border-slate-800" />

      <FormSection title="Relationship" description="How this person is related to the student">
        <Field label="Relation to student" htmlFor="relation" error={errors.relation?.message}>
          <Select
            id="relation"
            options={[
              { value: "father", label: "Father" },
              { value: "mother", label: "Mother" },
              { value: "guardian", label: "Guardian" },
              { value: "other", label: "Other" },
            ]}
            error={!!errors.relation}
            {...register("relation")}
          />
        </Field>
      </FormSection>
    </>
  );
}
