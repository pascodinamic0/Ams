"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch, type FieldErrors } from "react-hook-form";
import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";
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

import { formatClassOptionLabel, isClassFull } from "@/lib/utils/class-options";
import type { ClassListItem } from "@/lib/db/classes";

interface Props {
  schoolId: string;
  branchId: string;
  classes: ClassListItem[];
  existingGuardians: { id: string; name: string }[];
  canOverrideCapacity?: boolean;
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
  can_pickup: false,
};

const emptyPickupPerson = {
  full_name: "",
  phone: "",
  relationship: "",
  notes: "",
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

export function StudentForm({
  schoolId,
  branchId,
  classes,
  existingGuardians,
  canOverrideCapacity = false,
}: Props) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [overrideCapacity, setOverrideCapacity] = useState(false);

  function formatActionError(error: unknown): string {
    return firstErrorMessage(error) ?? t("failedToOnboard");
  }

  function onInvalid(errors: FieldErrors<StudentOnboardingData>) {
    toast.error(formatActionError(errors) ?? t("completeRequiredFields"));
  }

  async function onSubmit(data: StudentOnboardingData) {
    setLoading(true);
    try {
      const selectedClass = classes.find((c) => c.id === data.class_id);
      if (selectedClass && isClassFull(selectedClass) && !canOverrideCapacity) {
        toast.error(t("classFullNoOverride"));
        return;
      }
      if (
        selectedClass &&
        isClassFull(selectedClass) &&
        canOverrideCapacity &&
        !overrideCapacity
      ) {
        toast.error(t("enrollAnywayFullClassHint"));
        return;
      }

      const payload = {
        ...data,
        school_id: schoolId,
        branch_id: branchId,
        overrideCapacity: overrideCapacity && canOverrideCapacity,
      };
      if (data.existing_guardian_id) {
        payload.primary_guardian = undefined;
      }
      if (!data.add_secondary_guardian) {
        payload.secondary_guardian = undefined;
      }

      const result = await createStudentWithGuardians(payload);
      if ("error" in result && result.error) {
        toast.error(formatActionError(result.error));
        return;
      }
      toast.success(t("studentOnboarded", { studentId: "data" in result ? result.data?.student_id ?? "" : "" }));
      if ("data" in result && result.data?.id) {
        router.push(`/academic/students/${result.data.id}`);
      }
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("failedToOnboard")
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
        existing_guardian_can_pickup: false,
        photo_url: "",
        primary_guardian: defaultPrimaryGuardian,
        pickup_persons: [],
      }}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("studentOnboarding")}</CardTitle>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("studentOnboardingDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <StudentFormFields
            schoolId={schoolId}
            classes={classes}
            existingGuardians={existingGuardians}
            canOverrideCapacity={canOverrideCapacity}
            overrideCapacity={overrideCapacity}
            onOverrideCapacityChange={setOverrideCapacity}
          />
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => router.push("/academic/students")}
          >
            {tc("cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? tc("saving") : t("completeOnboarding")}
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

function GuardianFields({
  prefix,
  errors,
}: {
  prefix: "primary_guardian" | "secondary_guardian";
  errors: Record<string, unknown>;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const { register } = useFormContext<StudentOnboardingData>();
  const guardianErrors = (errors[prefix] ?? {}) as Record<string, { message?: string }>;
  const relationOptions = [
    { value: "father", label: t("relationFather") },
    { value: "mother", label: t("relationMother") },
    { value: "guardian", label: t("relationGuardian") },
    { value: "other", label: t("relationOther") },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("firstName")} htmlFor={`${prefix}.first_name`} required error={guardianErrors.first_name?.message}>
          <Input id={`${prefix}.first_name`} {...register(`${prefix}.first_name`)} error={!!guardianErrors.first_name} />
        </Field>
        <Field label={t("middleName")} htmlFor={`${prefix}.middle_name`} error={guardianErrors.middle_name?.message}>
          <Input id={`${prefix}.middle_name`} {...register(`${prefix}.middle_name`)} error={!!guardianErrors.middle_name} />
        </Field>
        <Field label={t("lastName")} htmlFor={`${prefix}.last_name`} required error={guardianErrors.last_name?.message}>
          <Input id={`${prefix}.last_name`} {...register(`${prefix}.last_name`)} error={!!guardianErrors.last_name} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tc("email")} htmlFor={`${prefix}.email`} required error={guardianErrors.email?.message}>
          <Input id={`${prefix}.email`} type="email" {...register(`${prefix}.email`)} error={!!guardianErrors.email} />
        </Field>
        <Field
          label={t("whatsappNumber")}
          htmlFor={`${prefix}.whatsapp`}
          hint={t("whatsappHint")}
        >
          <Input id={`${prefix}.whatsapp`} type="tel" {...register(`${prefix}.whatsapp`)} />
        </Field>
      </div>
      <Field label={t("relationToChild")} htmlFor={`${prefix}.relation`}>
        <Select
          id={`${prefix}.relation`}
          options={relationOptions}
          {...register(`${prefix}.relation`)}
        />
      </Field>
      <Field label={t("homeAddress")} htmlFor={`${prefix}.address`}>
        <Textarea id={`${prefix}.address`} rows={2} {...register(`${prefix}.address`)} />
      </Field>
      <Field label={t("workplace")} htmlFor={`${prefix}.workplace`}>
        <Input id={`${prefix}.workplace`} {...register(`${prefix}.workplace`)} />
      </Field>
      <label className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
        <input
          type="checkbox"
          className="mt-0.5 rounded border-stone-300"
          {...register(`${prefix}.can_pickup`)}
        />
        <span>
          {t("authorizedPickup")}
          <span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">
            {t("pickupMustSpecify")}
          </span>
        </span>
      </label>
    </>
  );
}

function PickupPersonsFields() {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const { register, setValue, formState: { errors } } = useFormContext<StudentOnboardingData>();
  const pickupPersons =
    useWatch<StudentOnboardingData, "pickup_persons">({ name: "pickup_persons" }) ?? [];
  const pickupRelationshipOptions = [
    { value: "uncle", label: t("pickupUncle") },
    { value: "aunt", label: t("pickupAunt") },
    { value: "grandparent", label: t("pickupGrandparent") },
    { value: "sibling", label: t("pickupSibling") },
    { value: "driver", label: t("pickupDriver") },
    { value: "nanny", label: t("pickupNanny") },
    { value: "family_friend", label: t("pickupFamilyFriend") },
    { value: "other", label: t("pickupOther") },
  ];

  function addPerson() {
    setValue("pickup_persons", [...pickupPersons, { ...emptyPickupPerson }], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function removePerson(index: number) {
    setValue(
      "pickup_persons",
      pickupPersons.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true }
    );
  }

  return (
    <FormSection
      title={t("whoMayPickup")}
      description={t("whoMayPickupDesc")}
    >
      {errors.pickup_persons?.message && (
        <p className="text-sm text-red-500">{errors.pickup_persons.message}</p>
      )}
      {typeof errors.pickup_persons?.root?.message === "string" && (
        <p className="text-sm text-red-500">{errors.pickup_persons.root.message}</p>
      )}

      {pickupPersons.map((_, index) => {
        const personErrors = (errors.pickup_persons?.[index] ?? {}) as Record<
          string,
          { message?: string }
        >;
        return (
          <div
            key={index}
            className="space-y-4 rounded-lg border border-stone-200 p-4 dark:border-stone-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-900 dark:text-white">
                {t("authorizedPerson", { number: index + 1 })}
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={() => removePerson(index)}>
                {tc("remove")}
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("fullName")}
                htmlFor={`pickup_persons.${index}.full_name`}
                required
                error={personErrors.full_name?.message}
              >
                <Input
                  id={`pickup_persons.${index}.full_name`}
                  {...register(`pickup_persons.${index}.full_name`)}
                  error={!!personErrors.full_name}
                />
              </Field>
              <Field
                label={tc("phone")}
                htmlFor={`pickup_persons.${index}.phone`}
                required
                error={personErrors.phone?.message}
              >
                <Input
                  id={`pickup_persons.${index}.phone`}
                  type="tel"
                  {...register(`pickup_persons.${index}.phone`)}
                  error={!!personErrors.phone}
                />
              </Field>
            </div>
            <Field
              label={t("relationshipToChild")}
              htmlFor={`pickup_persons.${index}.relationship`}
              required
              error={personErrors.relationship?.message}
            >
              <Select
                id={`pickup_persons.${index}.relationship`}
                placeholder={t("selectRelationship")}
                options={pickupRelationshipOptions}
                {...register(`pickup_persons.${index}.relationship`)}
              />
            </Field>
            <Field label={tc("optionalField", { label: tc("notes") })} htmlFor={`pickup_persons.${index}.notes`}>
              <Input
                id={`pickup_persons.${index}.notes`}
                placeholder={t("pickupNotesPlaceholder")}
                {...register(`pickup_persons.${index}.notes`)}
              />
            </Field>
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" onClick={addPerson}>
        {t("addPickupPerson")}
      </Button>
    </FormSection>
  );
}

function StudentFormFields({
  schoolId,
  classes,
  existingGuardians,
  canOverrideCapacity,
  overrideCapacity,
  onOverrideCapacityChange,
}: {
  schoolId: string;
  classes: ClassListItem[];
  existingGuardians: { id: string; name: string }[];
  canOverrideCapacity: boolean;
  overrideCapacity: boolean;
  onOverrideCapacityChange: (value: boolean) => void;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const { register, setValue, formState: { errors } } = useFormContext<StudentOnboardingData>();
  const existingGuardianId = useWatch({ name: "existing_guardian_id" });
  const addSecondary = useWatch({ name: "add_secondary_guardian" });
  const sameAddress = useWatch({ name: "same_address_as_guardian" });
  const primaryAddress = useWatch({ name: "primary_guardian.address" });
  const photoUrl = useWatch({ name: "photo_url" }) ?? "";
  const selectedClassId = useWatch({ name: "class_id" });
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classIsFull = selectedClass ? isClassFull(selectedClass) : false;
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraUploading, setCameraUploading] = useState(false);

  const useExistingGuardian = Boolean(existingGuardianId);
  const photoStoragePath = `${schoolId}/students`;

  async function handleCameraCapture(file: File) {
    if (file.size > STUDENT_PHOTO_MAX_BYTES) {
      toast.error(t("fileTooLarge", { max: STUDENT_PHOTO_MAX_BYTES / 1024 / 1024 }));
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
      toast.success(t("photoUploaded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("uploadFailed"));
      throw err;
    } finally {
      setCameraUploading(false);
    }
  }

  return (
    <>
      <FormSection title={t("childInformation")} description={t("childInformationDesc")}>
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
          <Field label={t("dateOfBirth")} htmlFor="date_of_birth" required error={errors.date_of_birth?.message}>
            <Input id="date_of_birth" type="date" {...register("date_of_birth")} error={!!errors.date_of_birth} />
          </Field>
          <Field label={t("gender")} htmlFor="gender">
            <Select
              id="gender"
              placeholder={t("selectOptional")}
              options={[
                { value: "male", label: t("genderMale") },
                { value: "female", label: t("genderFemale") },
                { value: "other", label: t("genderOther") },
              ]}
              {...register("gender")}
            />
          </Field>
        </div>
        <Field
          label={t("studentPhoto")}
          htmlFor="photo_url"
          error={errors.photo_url?.message}
          hint={t("studentPhotoHint")}
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
                toast.success(t("photoUploaded"));
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
              {t("takePhoto")}
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

      <FormSection title={t("enrollment")} description={t("enrollmentDesc")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("class")} htmlFor="class_id" required error={errors.class_id?.message}>
            <Select
              id="class_id"
              placeholder={t("selectClassRequired")}
              options={classes.map((c) => ({
                value: c.id,
                label: formatClassOptionLabel(c),
              }))}
              {...register("class_id")}
            />
          </Field>
          <Field label={tc("status")} htmlFor="status" error={errors.status?.message}>
            <Select
              id="status"
              options={[
                { value: "active", label: tc("active") },
                { value: "inactive", label: tc("inactive") },
                { value: "graduated", label: t("statusGraduated") },
              ]}
              {...register("status")}
            />
          </Field>
        </div>
        {classIsFull && !canOverrideCapacity ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t("classFullNoOverride")}</p>
        ) : null}
        {classIsFull && canOverrideCapacity ? (
          <label className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-stone-300"
              checked={overrideCapacity}
              onChange={(e) => onOverrideCapacityChange(e.target.checked)}
            />
            <span>
              <span className="font-medium">{t("enrollAnywayFullClass")}</span>
              <span className="mt-0.5 block text-xs text-stone-500">{t("enrollAnywayFullClassHint")}</span>
            </span>
          </label>
        ) : null}
      </FormSection>

      <div className="border-t border-stone-200 dark:border-stone-800" />

      <FormSection title={t("childHomeHealth")} description={t("childHomeHealthDesc")}>
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
          {t("sameAddressAsGuardian")}
        </label>
        <Field label={t("childHomeAddress")} htmlFor="home_address">
          <Textarea
            id="home_address"
            rows={2}
            disabled={sameAddress}
            {...register("home_address")}
          />
        </Field>
        <Field
          label={t("notesAboutChild")}
          htmlFor="notes"
          hint={t("notesAboutChildHint")}
        >
          <Textarea id="notes" rows={3} {...register("notes")} placeholder={t("notesAboutChildPlaceholder")} />
        </Field>
      </FormSection>

      <div className="border-t border-stone-200 dark:border-stone-800" />

      <FormSection title={t("primaryGuardian")} description={t("primaryGuardianDesc")}>
        {existingGuardians.length > 0 && (
          <Field
            label={t("linkExistingGuardian")}
            htmlFor="existing_guardian_id"
            error={errors.existing_guardian_id?.message}
          >
            <Select
              id="existing_guardian_id"
              placeholder={t("createNewGuardian")}
              options={existingGuardians.map((g) => ({ value: g.id, label: g.name }))}
              error={!!errors.existing_guardian_id}
              {...register("existing_guardian_id")}
            />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t("linkExistingGuardianHint")}
            </p>
          </Field>
        )}
        {useExistingGuardian ? (
          <label className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-stone-300"
              {...register("existing_guardian_can_pickup")}
            />
            <span>
              {t("existingGuardianPickup")}
              <span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">
                {t("existingGuardianPickupHint")}
              </span>
            </span>
          </label>
        ) : (
          <GuardianFields prefix="primary_guardian" errors={errors} />
        )}
      </FormSection>

      <div className="border-t border-stone-200 dark:border-stone-800" />

      <FormSection title={t("secondGuardian")} description={t("secondGuardianDesc")}>
        <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
          <input
            type="checkbox"
            className="rounded border-stone-300"
            {...register("add_secondary_guardian")}
          />
          {t("addSecondGuardian")}
        </label>
        {addSecondary && <GuardianFields prefix="secondary_guardian" errors={errors} />}
      </FormSection>

      <div className="border-t border-stone-200 dark:border-stone-800" />

      <PickupPersonsFields />
    </>
  );
}
