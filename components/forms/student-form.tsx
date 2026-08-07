"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch, type FieldErrors } from "react-hook-form";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { CameraCaptureModal } from "@/components/profile/camera-capture-modal";
import { createStudentWithGuardians } from "@/lib/actions/student-onboarding";
import { studentOnboardingSchema, type StudentOnboardingData } from "@/lib/validations/student-onboarding";
import { toast } from "@/lib/toast";

const STUDENT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  schoolId: string;
  branchId: string;
  classes: { id: string; name: string }[];
  existingGuardians: { id: string; name: string }[];
}

const defaultPrimaryGuardian = {
  first_name: "",
  middle_name: "",
  last_name: "",
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
        photo_url: "",
        primary_guardian: defaultPrimaryGuardian,
      }}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
    >
      <Card>
        <CardHeader>
          <CardTitle>Student onboarding</CardTitle>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Register the child and their guardian(s) in one step.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <StudentFormFields
            schoolId={schoolId}
            classes={classes}
            existingGuardians={existingGuardians}
          />
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="First name" htmlFor={`${prefix}.first_name`} required error={guardianErrors.first_name?.message}>
          <Input id={`${prefix}.first_name`} {...register(`${prefix}.first_name`)} error={!!guardianErrors.first_name} />
        </Field>
        <Field label="Middle name" htmlFor={`${prefix}.middle_name`} error={guardianErrors.middle_name?.message}>
          <Input id={`${prefix}.middle_name`} {...register(`${prefix}.middle_name`)} error={!!guardianErrors.middle_name} />
        </Field>
        <Field label="Last name" htmlFor={`${prefix}.last_name`} required error={guardianErrors.last_name?.message}>
          <Input id={`${prefix}.last_name`} {...register(`${prefix}.last_name`)} error={!!guardianErrors.last_name} />
        </Field>
      </div>
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
  schoolId,
  classes,
  existingGuardians,
}: {
  schoolId: string;
  classes: { id: string; name: string }[];
  existingGuardians: { id: string; name: string }[];
}) {
  const { register, setValue, formState: { errors } } = useFormContext<StudentOnboardingData>();
  const existingGuardianId = useWatch({ name: "existing_guardian_id" });
  const addSecondary = useWatch({ name: "add_secondary_guardian" });
  const sameAddress = useWatch({ name: "same_address_as_guardian" });
  const primaryAddress = useWatch({ name: "primary_guardian.address" });
  const photoUrl = useWatch({ name: "photo_url" }) ?? "";
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraUploading, setCameraUploading] = useState(false);

  const useExistingGuardian = Boolean(existingGuardianId);
  const photoStoragePath = `${schoolId}/students`;

  async function handleCameraCapture(file: File) {
    if (file.size > STUDENT_PHOTO_MAX_BYTES) {
      toast.error(`File too large. Max ${STUDENT_PHOTO_MAX_BYTES / 1024 / 1024}MB`);
      throw new Error("File too large");
    }

    setCameraUploading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `${photoStoragePath}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("school-assets").upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from("school-assets").getPublicUrl(filePath);
      setValue("photo_url", data.publicUrl, { shouldDirty: true, shouldValidate: true });
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setCameraUploading(false);
    }
  }

  return (
    <>
      <FormSection title="Child information" description="Basic details for the student">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="First name" htmlFor="first_name" required error={errors.first_name?.message}>
            <Input id="first_name" {...register("first_name")} error={!!errors.first_name} />
          </Field>
          <Field label="Middle name" htmlFor="middle_name" error={errors.middle_name?.message}>
            <Input id="middle_name" {...register("middle_name")} error={!!errors.middle_name} />
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
        <Field
          label="Student photo"
          htmlFor="photo_url"
          error={errors.photo_url?.message}
          hint="Optional. Upload a file or take a photo with the webcam."
        >
          <input type="hidden" {...register("photo_url")} />
          <div className="space-y-2">
            <FileUpload
              bucket="school-assets"
              path={photoStoragePath}
              accept="image/jpeg,image/png,image/gif,image/webp"
              maxSize={STUDENT_PHOTO_MAX_BYTES}
              value={photoUrl || undefined}
              onUpload={(url) => {
                setValue("photo_url", url, { shouldDirty: true, shouldValidate: true });
                toast.success("Photo uploaded");
              }}
              onRemove={() => setValue("photo_url", "", { shouldDirty: true, shouldValidate: true })}
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
              Take photo
            </Button>
          </div>
          <CameraCaptureModal
            isOpen={cameraOpen}
            onClose={() => setCameraOpen(false)}
            onCapture={handleCameraCapture}
            disabled={cameraUploading}
          />
        </Field>
      </FormSection>

      <div className="border-t border-stone-200 dark:border-stone-800" />

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

      <div className="border-t border-stone-200 dark:border-stone-800" />

      <FormSection title="Child home & health" description="Where the child lives and any care notes">
        <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
          <input
            type="checkbox"
            className="rounded border-stone-300"
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

      <div className="border-t border-stone-200 dark:border-stone-800" />

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
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Choose an existing guardian when enrolling a sibling.
            </p>
          </Field>
        )}
        {!useExistingGuardian && (
          <GuardianFields prefix="primary_guardian" errors={errors} />
        )}
      </FormSection>

      <div className="border-t border-stone-200 dark:border-stone-800" />

      <FormSection title="Second guardian" description="Optional additional contact">
        <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
          <input
            type="checkbox"
            className="rounded border-stone-300"
            {...register("add_secondary_guardian")}
          />
          Add a second guardian
        </label>
        {addSecondary && <GuardianFields prefix="secondary_guardian" errors={errors} />}
      </FormSection>
    </>
  );
}
