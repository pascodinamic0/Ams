"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { SchoolYearSelect } from "@/components/academic/school-year-select";
import { createFeeStructure } from "@/lib/actions/fee-structures";
import { getCurrentSchoolYearStart } from "@/lib/academic/school-year";
import { feeStructureSchema, type FeeStructureFormData } from "@/lib/validations/finance";
import { toast } from "@/lib/toast";

interface Props {
  branchId: string;
  classes: { id: string; name: string }[];
  onClassChange?: (classId: string) => void;
}

export function FeeStructureForm({ branchId, classes, onClassChange }: Props) {
  const router = useRouter();
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const defaultYear = getCurrentSchoolYearStart();

  async function onSubmit(data: FeeStructureFormData) {
    const result = await createFeeStructure({ ...data, branch_id: branchId });
    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string"
          ? result.error
          : t("feeStructureCreateFailed")
      );
      return;
    }
    toast.success(t("feeStructureCreated"));
    router.refresh();
  }

  return (
    <FormWrapper
      schema={feeStructureSchema}
      defaultValues={{
        branch_id: branchId,
        amount: 0,
        school_year: defaultYear,
      }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <FeeStructureFields
        classes={classes}
        schoolYearLabel={tc("schoolYear")}
        onClassChange={onClassChange}
      />
    </FormWrapper>
  );
}

function FeeStructureFields({
  classes,
  schoolYearLabel,
  onClassChange,
}: {
  classes: { id: string; name: string }[];
  schoolYearLabel: string;
  onClassChange?: (classId: string) => void;
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const {
    register,
    formState: { errors, isSubmitting },
  } = useFormContext<FeeStructureFormData>();

  return (
    <>
      <div>
        <Label htmlFor="name" required>
          {tc("name")}
        </Label>
        <Input id="name" {...register("name")} error={!!errors.name} />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="amount" required>
          {tc("amount")}
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount")}
          error={!!errors.amount}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>
      <SchoolYearSelect
        label={schoolYearLabel}
        required
        error={!!errors.school_year}
        {...register("school_year", { valueAsNumber: true })}
      />
      <div>
        <Label htmlFor="class_id">{t("classOptional")}</Label>
        <select
          id="class_id"
          {...register("class_id", {
            onChange: (event) => {
              onClassChange?.(event.target.value);
            },
          })}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">{t("allClasses")}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="description">{tc("description")}</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div className="flex items-end sm:col-span-2">
        <Button
          type="submit"
          className="h-auto w-full whitespace-normal text-center leading-tight"
          disabled={isSubmitting}
        >
          {t("addFeeStructure")}
        </Button>
      </div>
    </>
  );
}
