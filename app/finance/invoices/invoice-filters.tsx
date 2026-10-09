"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function InvoiceFilters({ classOptions }: { classOptions: string[] }) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status") ?? "unpaid";
  const status = ["unpaid", "overdue", "paid", "all"].includes(rawStatus)
    ? rawStatus
    : "unpaid";
  const search = searchParams.get("search") ?? "";
  const className = searchParams.get("class") ?? "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const clear =
      !value || (key === "status" && value === "unpaid");
    if (clear) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `/finance/invoices?${qs}` : "/finance/invoices");
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <Label htmlFor="status-filter">{tc("status")}</Label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => updateParams("status", e.target.value)}
          className="mt-1 w-full min-w-[140px] rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="unpaid">{t("statusUnpaid")}</option>
          <option value="overdue">{t("overdue")}</option>
          <option value="paid">{tc("paid")}</option>
          <option value="all">{tc("all")}</option>
        </select>
      </div>
      <div>
        <Label htmlFor="class-filter">{t("colClass")}</Label>
        <select
          id="class-filter"
          value={className}
          onChange={(e) => updateParams("class", e.target.value)}
          className="mt-1 w-full min-w-[160px] rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">{t("allClasses")}</option>
          {classOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[200px] flex-1">
        <Label htmlFor="search-filter">{tc("search")}</Label>
        <Input
          id="search-filter"
          defaultValue={search}
          placeholder={t("searchStudentsPlaceholder")}
          onBlur={(e) => updateParams("search", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParams("search", e.currentTarget.value);
          }}
        />
      </div>
    </div>
  );
}
