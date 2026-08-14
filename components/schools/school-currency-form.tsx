"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateSchoolCurrency } from "@/lib/actions/schools";
import {
  formatMoney,
  getSchoolCurrency,
  normalizeCurrencyCode,
  SCHOOL_CURRENCIES,
  type SchoolCurrencyCode,
} from "@/lib/currency";
import { toast } from "@/lib/toast";

type Props = {
  schoolId: string;
  currencyCode: string | null | undefined;
  title?: string;
  description?: string;
  compact?: boolean;
};

export function SchoolCurrencyForm({
  schoolId,
  currencyCode,
  title,
  description,
  compact = false,
}: Props) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const ta = useTranslations("admin");
  const resolvedTitle = title ?? t("currencyTitle");
  const resolvedDescription = description ?? t("currencyDescription");
  const router = useRouter();
  const initialCode = normalizeCurrencyCode(currencyCode);
  const [code, setCode] = useState<SchoolCurrencyCode>(initialCode);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateSchoolCurrency(schoolId, code);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(ta("currencyUpdated"));
    router.refresh();
  }

  const fields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="school-currency">{t("currencyLabel")}</Label>
        <Select
          id="school-currency"
          options={SCHOOL_CURRENCIES.map((currency) => ({
            value: currency.code,
            label: `${currency.label} (${currency.symbol})`,
          }))}
          value={code}
          onChange={(e) => setCode(normalizeCurrencyCode(e.target.value))}
        />
      </div>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {t("currencyPreview", { amount: formatMoney(1234.56, code) })}
      </p>
      <div className={compact ? "flex justify-end" : undefined}>
        <Button type="submit" disabled={loading || code === initialCode}>
          {loading ? tc("saving") : t("saveCurrency")}
        </Button>
      </div>
    </>
  );

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-stone-200 p-4 dark:border-stone-800"
      >
        {resolvedTitle ? (
          <p className="font-medium text-stone-900 dark:text-white">{resolvedTitle}</p>
        ) : null}
        {resolvedDescription ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {resolvedDescription}
          </p>
        ) : null}
        {fields}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{resolvedTitle}</CardTitle>
          {resolvedDescription ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {resolvedDescription}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">{fields}</CardContent>
      </Card>
    </form>
  );
}

export function SchoolCurrencyBadge({
  currencyCode,
}: {
  currencyCode: string | null | undefined;
}) {
  const currency = getSchoolCurrency(currencyCode);
  return (
    <span className="text-sm text-stone-500 dark:text-stone-400">
      {currency.label} ({currency.symbol})
    </span>
  );
}
