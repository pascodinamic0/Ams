"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("finance");

  async function onSubmit(data: PayrollGenerateFormData) {
    const result = await generatePayroll({ ...data, schoolId, branchId });
    if ("error" in result && result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("generatePayrollFailed"));
      return;
    }
    const created = "data" in result ? result.data?.created ?? 0 : 0;
    const skipped = "data" in result ? result.data?.skipped ?? 0 : 0;
    toast.success(
      skipped > 0
        ? t("payrollGeneratedWithExcluded", { created, skipped })
        : t("payrollGenerated", { count: created })
    );
    router.push(`/finance/payroll?month=${data.month}&year=${data.year}`);
    router.refresh();
  }

  return (
    <FormWrapper
      schema={payrollGenerateSchema}
      defaultValues={{ month: defaultMonth, year: defaultYear }}
      onSubmit={onSubmit}
      className="flex flex-nowrap items-end gap-2"
    >
      <GenerateFields />
    </FormWrapper>
  );
}

function GenerateFields() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("finance");
  const { register, formState: { errors, isSubmitting }, control } = useFormContext<PayrollGenerateFormData>();
  const month = useWatch({ control, name: "month" });
  const year = useWatch({ control, name: "year" });
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    if (!month || !year) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("month") === String(month) && params.get("year") === String(year)) return;
    params.set("month", String(month));
    params.set("year", String(year));
    router.replace(`/finance/payroll?${params.toString()}`);
  }, [month, year, router]);

  const selectClass =
    "h-10 capitalize rounded-lg border border-border bg-surface px-3 text-sm dark:border-stone-700 dark:bg-stone-900";

  return (
    <>
      <div>
        <Label htmlFor="gen_month" required>{t("month")}</Label>
        <select
          id="gen_month"
          {...register("month", { valueAsNumber: true })}
          className={`w-36 ${selectClass}`}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {new Date(Date.UTC(2026, m - 1, 1)).toLocaleDateString(locale, {
                month: "long",
              })}
            </option>
          ))}
        </select>
        {errors.month && <p className="mt-1 text-sm text-red-500">{errors.month.message}</p>}
      </div>
      <div>
        <Label htmlFor="gen_year" required>{t("year")}</Label>
        <select
          id="gen_year"
          {...register("year", { valueAsNumber: true })}
          className={`w-24 ${selectClass}`}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>{t("generatePayroll")}</Button>
    </>
  );
}
