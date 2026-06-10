"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch, type FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createStudentWithGuardians } from "@/lib/actions/student-onboarding";
import { studentOnboardingSchema, type StudentOnboardingData } from "@/lib/validations/student-onboarding";
import { toast } from "@/lib/toast";

interface Props {
  schoolId: string;
  branchId: string;
  classes: { id: string; name: string }[];
  existingGuardians: { id: string; name: string }[];
}

const defaultPrimaryGuardian = {
  name: "",
  email: "",
  whatsapp: "",
  relation: "guardian" as const,
  address: "",
  workplace: "",
};

function firstErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  if (Array.isArray(error)) {
    for (const item of error) {
      const nested = firstErrorMessage(item);
      if (nested) return nested;
    }
  }
  if (typeof error === "object" && error !== null) {
    for (const value of Object.values(error)) {
      const nested = firstErrorMessage(value);
      if (nested) return nested;
    }
  }
  return undefined;
}

function formatActionError(error: unknown): string {
  return firstErrorMessage(error) ?? "Failed to onboard student";
}

function onInvalid(errors: FieldErrors<StudentOnboardingData>) {
  toast.error(formatActionError(errors) ?? "Please complete all required fields");
}

export function StudentForm({ schoolId, branchId, classes, existingGuardians }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: StudentOnboardingData) {
    setLoading(true);
    try {
      const payload = { ...data, school_id: schoolId, branch_id: branchId };
      if (data.existing_guardian_id) {
        payload.primary_guardian = undefined;
      }
      if (!data.add_secondary_guardian) {
        payload.secondary_guardian = undefined;
      }

      const result = await createStudentWithGuardians(payload);
      if (result.error) {
        toast.error(formatActionError(result.error));
        return;
      }
      toast.success(`Student onboarded (${result.data?.student_id ?? ""})`);
      router.push(`/academic/students/${result.data?.id}`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to onboard student"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormWrapper
      schema={studentOnboardingSchema}
      defaultValues={{
        status: "active",
        add_secondary_guardian: false,
        primary_guardian: defaultPrimaryGuardian,
      }}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
    >
      <Card>
        <CardHeader>
          <CardTitle>Student onboarding</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Register the child and their guardian(s) in one step.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <StudentFormFields classes={classes} existingGuardians={existingGuardians} />
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => router.push("/academic/students")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Complete onboarding"}
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

const relationOptions = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
];

function GuardianFields({
  prefix,
  errors,
}: {
  prefix: "primary_guardian" | "secondary_guardian";
  errors: Record<string, unknown>;
}) {
  const { register } = useFormContext<StudentOnboardingData>();
  const guardianErrors = (errors[prefix] ?? {}) as Record<string, { message?: string }>;

  return (
    <>
      <Field label="Full name" htmlFor={`${prefix}.name`} required error={guardianErrors.name?.message}>
        <Input id={`${prefix}.name`} {...register(`${prefix}.name`)} error={!!guardianErrors.name} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor={`${prefix}.email`} required error={guardianErrors.email?.message}>
          <Input id={`${prefix}.email`} type="email" {...register(`${prefix}.email`)} error={!!guardianErrors.email} />
        </Field>
        <Field
          label="WhatsApp number"
          htmlFor={`${prefix}.whatsapp`}
          hint="Used for fee reminders and school messages"
        >
          <Input id={`${prefix}.whatsapp`} type="tel" {...register(`${prefix}.whatsapp`)} />
        </Field>
      </div>
      <Field label="Relation to child" htmlFor={`${prefix}.relation`}>
        <Select
          id={`${prefix}.relation`}
          options={relationOptions}
          {...register(`${prefix}.relation`)}
        />
      </Field>
      <Field label="Home address" htmlFor={`${prefix}.address`}>
        <Textarea id={`${prefix}.address`} rows={2} {...register(`${prefix}.address`)} />
      </Field>
      <Field label="Workplace" htmlFor={`${prefix}.workplace`}>
        <Input id={`${prefix}.workplace`} {...register(`${prefix}.workplace`)} />
      </Field>
    </>
  );
}

function StudentFormFields({
  classes,
  existingGuardians,
}: {
  classes: { id: string; name: string }[];
  existingGuardians: { id: string; name: string }[];
}) {
  const { register, setValue, formState: { errors } } = useFormContext<StudentOnboardingData>();
  const existingGuardianId = useWatch({ name: "existing_guardian_id" });
  const addSecondary = useWatch({ name: "add_secondary_guardian" });
  const sameAddress = useWatch({ name: "same_address_as_guardian" });
  const primaryAddress = useWatch({ name: "primary_guardian.address" });

  const useExistingGuardian = Boolean(existingGuardianId);

  return (
    <>
      <FormSection title="Child information" description="Basic details for the student">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="first_name" required error={errors.first_name?.message}>
            <Input id="first_name" {...register("first_name")} error={!!errors.first_name} />
          </Field>
          <Field label="Last name" htmlFor="last_name" required error={errors.last_name?.message}>
            <Input id="last_name" {...register("last_name")} error={!!errors.last_name} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="date_of_birth" required error={errors.date_of_birth?.message}>
            <Input id="date_of_birth" type="date" {...register("date_of_birth")} error={!!errors.date_of_birth} />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <Select
              id="gender"
              placeholder="Select (optional)"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              {...register("gender")}
            />
          </Field>
        </div>
      </FormSection>

      <div className="border-t border-slate-200 dark:border-slate-800" />

      <FormSection title="Enrollment" description="Class and status">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class" htmlFor="class_id">
            <Select
              id="class_id"
              placeholder="Select class (optional)"
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
              {...register("class_id")}
            />
          </Field>
          <Field label="Status" htmlFor="status" error={errors.status?.message}>
            <Select
              id="status"
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "graduated", label: "Graduated" },
              ]}
              {...register("status")}
            />
          </Field>
        </div>
      </FormSection>

      <div className="border-t border-slate-200 dark:border-slate-800" />

      <FormSection title="Child home & health" description="Where the child lives and any care notes">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            className="rounded border-slate-300"
            {...register("same_address_as_guardian")}
            onChange={(e) => {
              register("same_address_as_guardian").onChange(e);
              if (e.target.checked && primaryAddress) {
                setValue("home_address", primaryAddress);
              }
            }}
          />
          Same address as primary guardian
        </label>
        <Field label="Child home address" htmlFor="home_address">
          <Textarea
            id="home_address"
            rows={2}
            disabled={sameAddress}
            {...register("home_address")}
          />
        </Field>
        <Field
          label="Notes about the child"
          htmlFor="notes"
          hint="Allergies, sickness history, medications, or other information staff should know"
        >
          <Textarea id="notes" rows={3} {...register("notes")} placeholder="e.g. Asthma — inhaler in school bag" />
        </Field>
      </FormSection>

      <div className="border-t border-slate-200 dark:border-slate-800" />

      <FormSection title="Primary guardian" description="Parent or guardian responsible for this child">
        {existingGuardians.length > 0 && (
          <Field
            label="Link existing guardian (optional)"
            htmlFor="existing_guardian_id"
            error={errors.existing_guardian_id?.message}
          >
            <Select
              id="existing_guardian_id"
              placeholder="Create new guardian"
              options={existingGuardians.map((g) => ({ value: g.id, label: g.name }))}
              error={!!errors.existing_guardian_id}
              {...register("existing_guardian_id")}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose an existing guardian when enrolling a sibling.
            </p>
          </Field>
        )}
        {!useExistingGuardian && (
          <GuardianFields prefix="primary_guardian" errors={errors} />
        )}
      </FormSection>

      <div className="border-t border-slate-200 dark:border-slate-800" />

      <FormSection title="Second guardian" description="Optional additional contact">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            className="rounded border-slate-300"
            {...register("add_secondary_guardian")}
          />
          Add a second guardian
        </label>
        {addSecondary && <GuardianFields prefix="secondary_guardian" errors={errors} />}
      </FormSection>
    </>
  );
}
