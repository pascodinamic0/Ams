"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createBudgetLineItem } from "@/lib/actions/budget";
import { schoolYearMonthOptions } from "@/lib/academic/school-year";
import {
  budgetLineItemSchema,
  type BudgetLineItemFormData,
} from "@/lib/validations/finance";
import { toast } from "@/lib/toast";

const QUARTER_OPTIONS = ["Q1", "Q2", "Q3", "Q4"] as const;
const TRIMESTER_OPTIONS = ["T1", "T2", "T3"] as const;

function defaultPeriodKey(
  periodType: BudgetLineItemFormData["period_type"],
  planYear: number
) {
  switch (periodType) {
    case "quarter":
      return "Q1";
    case "trimester":
      return "T1";
    case "month":
      return schoolYearMonthOptions(planYear)[0]?.value ?? `${planYear}-09`;
    default:
      return "year";
  }
}

type Props = {
  planId: string;
  planYear: number;
  labels: {
    category: string;
    name: string;
    description: string;
    quantity: string;
    unitCost: string;
    periodType: string;
    periodKey: string;
    submit: string;
    created: string;
    failed: string;
    periodYear: string;
    periodQuarter: string;
    periodTrimester: string;
    periodMonth: string;
  };
};

export function BudgetLineForm({ planId, planYear, labels }: Props) {
  const router = useRouter();

  async function onSubmit(data: BudgetLineItemFormData) {
    const result = await createBudgetLineItem(planId, {
      ...data,
      period_key:
        data.period_type === "year"
          ? "year"
          : data.period_key || defaultPeriodKey(data.period_type, planYear),
    });
    if (result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : labels.failed
      );
      return;
    }
    toast.success(labels.created);
    router.refresh();
  }

  return (
    <FormWrapper
      schema={budgetLineItemSchema}
      defaultValues={{
        category: "",
        name: "",
        description: "",
        quantity: 1,
        unit_cost: 0,
        period_type: "year",
        period_key: "year",
        status: "planned",
        sort_order: 0,
      }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <BudgetLineFields labels={labels} planYear={planYear} />
    </FormWrapper>
  );
}

function BudgetLineFields({
  labels,
  planYear,
}: {
  labels: Props["labels"];
  planYear: number;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useFormContext<BudgetLineItemFormData>();
  const periodType = watch("period_type");
  const showPeriodKey = periodType !== "year";

  useEffect(() => {
    setValue("period_key", defaultPeriodKey(periodType, planYear), {
      shouldValidate: true,
    });
  }, [periodType, planYear, setValue]);

  return (
    <>
      <div>
        <Label htmlFor="category" required>
          {labels.category}
        </Label>
        <Input id="category" {...register("category")} error={!!errors.category} />
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="name" required>
          {labels.name}
        </Label>
        <Input id="name" {...register("name")} error={!!errors.name} />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="quantity" required>
          {labels.quantity}
        </Label>
        <Input
          id="quantity"
          type="number"
          step="0.01"
          {...register("quantity")}
          error={!!errors.quantity}
        />
      </div>
      <div>
        <Label htmlFor="unit_cost" required>
          {labels.unitCost}
        </Label>
        <Input
          id="unit_cost"
          type="number"
          step="0.01"
          {...register("unit_cost")}
          error={!!errors.unit_cost}
        />
      </div>
      <div>
        <Label htmlFor="period_type" required>
          {labels.periodType}
        </Label>
        <select
          id="period_type"
          {...register("period_type")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="year">{labels.periodYear}</option>
          <option value="quarter">{labels.periodQuarter}</option>
          <option value="trimester">{labels.periodTrimester}</option>
          <option value="month">{labels.periodMonth}</option>
        </select>
      </div>
      {showPeriodKey ? (
        <div>
          <Label htmlFor="period_key" required>
            {labels.periodKey}
          </Label>
          <select
            id="period_key"
            {...register("period_key")}
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            {periodType === "quarter"
              ? QUARTER_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))
              : null}
            {periodType === "trimester"
              ? TRIMESTER_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))
              : null}
            {periodType === "month"
              ? schoolYearMonthOptions(planYear).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : null}
          </select>
          {errors.period_key && (
            <p className="mt-1 text-sm text-red-500">
              {errors.period_key.message}
            </p>
          )}
        </div>
      ) : null}
      <div className="sm:col-span-2">
        <Label htmlFor="description">{labels.description}</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div className="flex items-end lg:col-span-4">
        <Button type="submit" disabled={isSubmitting}>{labels.submit}</Button>
      </div>
    </>
  );
}
