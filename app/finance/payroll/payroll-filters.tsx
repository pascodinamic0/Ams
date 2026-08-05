"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PayrollFiltersProps {
  positions: string[];
  departments: string[];
}

export function PayrollFilters({ positions, departments }: PayrollFiltersProps) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/finance/payroll?${params.toString()}`);
  }

  return (
    <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-6">
      <div>
        <Label htmlFor="payroll-search">{tc("search")}</Label>
        <Input
          id="payroll-search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder={t("payrollSearchPlaceholder")}
          onBlur={(e) => updateParam("search", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParam("search", e.currentTarget.value);
          }}
        />
      </div>
      <div>
        <Label htmlFor="payroll-status">{tc("status")}</Label>
        <select
          id="payroll-status"
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">{tc("all")}</option>
          <option value="pending">{t("statusPending")}</option>
          <option value="paid">{t("statusPaid")}</option>
        </select>
      </div>
      <div>
        <Label htmlFor="payroll-position">{t("positionLabel")}</Label>
        <select
          id="payroll-position"
          value={searchParams.get("position") ?? ""}
          onChange={(e) => updateParam("position", e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">{tc("all")}</option>
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="payroll-month">{t("colMonth")}</Label>
        <Input
          id="payroll-month"
          type="number"
          min="1"
          max="12"
          defaultValue={searchParams.get("month") ?? ""}
          onBlur={(e) => updateParam("month", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParam("month", e.currentTarget.value);
          }}
        />
      </div>
      <div>
        <Label htmlFor="payroll-year">{t("yearLabel")}</Label>
        <Input
          id="payroll-year"
          type="number"
          min="2000"
          max="2100"
          defaultValue={searchParams.get("year") ?? ""}
          onBlur={(e) => updateParam("year", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParam("year", e.currentTarget.value);
          }}
        />
      </div>
      <div>
        <Label htmlFor="payroll-department">{t("departmentLabel")}</Label>
        <select
          id="payroll-department"
          value={searchParams.get("department") ?? ""}
          onChange={(e) => updateParam("department", e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">{tc("all")}</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
