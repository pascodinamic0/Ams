"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { generatePayroll } from "@/lib/actions/payroll";
import {
  payrollGenerateSchema,
  type PayrollGenerateFormData,
} from "@/lib/validations/finance";
import { toast } from "@/lib/toast";

interface GenerateProps {
  schoolId?: string;
  branchId?: string;
  defaultMonth?: number;
  defaultYear?: number;
}

export function PayrollGenerateForm({
  schoolId,
  branchId,
  defaultMonth = new Date().getMonth() + 1,
  defaultYear = new Date().getFullYear(),
}: GenerateProps) {
  const router = useRouter();

  async function onSubmit(data: PayrollGenerateFormData) {
    const result = await generatePayroll({ ...data, schoolId, branchId });
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to generate payroll");
      return;
    }
    const created = result.data?.created ?? 0;
    toast.success(`Generated payroll for ${created} staff members`);
    router.refresh();
  }

  return (
    <FormWrapper
      schema={payrollGenerateSchema}
      defaultValues={{ month: defaultMonth, year: defaultYear }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <GenerateFields />
    </FormWrapper>
  );
}

function GenerateFields() {
  const { register, formState: { errors } } = useFormContext<PayrollGenerateFormData>();
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <>
      <div>
        <Label htmlFor="gen_month" required>Month</Label>
        <select
          id="gen_month"
          {...register("month", { valueAsNumber: true })}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {new Date(Date.UTC(2026, month - 1, 1)).toLocaleDateString(undefined, {
                month: "long",
              })}
            </option>
          ))}
        </select>
        {errors.month && <p className="mt-1 text-sm text-red-500">{errors.month.message}</p>}
      </div>
      <div>
        <Label htmlFor="gen_year" required>Year</Label>
        <select
          id="gen_year"
          {...register("year", { valueAsNumber: true })}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year.message}</p>}
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">Generate payroll</Button>
      </div>
    </>
  );
}
