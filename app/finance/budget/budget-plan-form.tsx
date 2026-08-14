"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { SchoolYearSelect } from "@/components/academic/school-year-select";
import { createBudgetPlan } from "@/lib/actions/budget";
import {
  budgetPlanSchema,
  type BudgetPlanFormData,
} from "@/lib/validations/finance";
import { toast } from "@/lib/toast";

type Props = {
  defaultYear: number;
  labels: {
    title: string;
    year: string;
    labelOptional: string;
    notes: string;
    submit: string;
    created: string;
    failed: string;
  };
};

export function BudgetPlanForm({ defaultYear, labels }: Props) {
  const router = useRouter();

  async function onSubmit(data: BudgetPlanFormData) {
    const result = await createBudgetPlan(data);
    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : labels.failed
      );
      return;
    }
    toast.success(labels.created);
    if ("data" in result && result.data?.id) {
      router.push(`/finance/budget/${result.data.id}`);
      return;
    }
    router.refresh();
  }

  return (
    <FormWrapper
      schema={budgetPlanSchema}
      defaultValues={{
        year: defaultYear,
        title: "",
        label: "",
        notes: "",
        status: "draft",
      }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <BudgetPlanFields labels={labels} defaultYear={defaultYear} />
    </FormWrapper>
  );
}

function BudgetPlanFields({
  labels,
  defaultYear,
}: {
  labels: Props["labels"];
  defaultYear: number;
}) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useFormContext<BudgetPlanFormData>();

  return (
    <>
      <div>
        <Label htmlFor="title" required>
          {labels.title}
        </Label>
        <Input id="title" {...register("title")} error={!!errors.title} />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>
      <div>
        <SchoolYearSelect
          id="year"
          label={labels.year}
          required
          centerStartYear={defaultYear}
          error={!!errors.year}
          {...register("year", { valueAsNumber: true })}
        />
        {errors.year ? (
          <p className="mt-1 text-sm text-red-500">{errors.year.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="label">{labels.labelOptional}</Label>
        <Input id="label" {...register("label")} />
      </div>
      <div>
        <Label htmlFor="notes">{labels.notes}</Label>
        <Input id="notes" {...register("notes")} />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {labels.submit}
        </Button>
      </div>
    </>
  );
}
