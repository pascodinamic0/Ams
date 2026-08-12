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
import { updateSchoolLocale } from "@/lib/actions/schools";
import { localeNames, type Locale } from "@/i18n/config";
import { toast } from "@/lib/toast";

type Props = {
  schoolId: string;
  locale: string | null | undefined;
  title?: string;
  description?: string;
};

export function SchoolLocaleForm({
  schoolId,
  locale,
  title,
  description,
}: Props) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const ta = useTranslations("admin");
  const resolvedTitle = title ?? t("localeTitle");
  const resolvedDescription = description ?? t("localeDescription");
  const router = useRouter();
  const initialLocale = (locale === "fr" ? "fr" : "en") as Locale;
  const [value, setValue] = useState<Locale>(initialLocale);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateSchoolLocale(schoolId, value);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(ta("systemLanguageUpdated"));
    window.location.reload();
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resolvedTitle}</CardTitle>
        <p className="text-sm text-stone-500 dark:text-stone-400">{resolvedDescription}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school-locale">{t("languageLabel")}</Label>
            <Select
              id="school-locale"
              options={(Object.entries(localeNames) as [Locale, string][]).map(
                ([code, name]) => ({
                  value: code,
                  label: name,
                })
              )}
              value={value}
              onChange={(e) => setValue(e.target.value as Locale)}
            />
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("afterSavingLanguage", { language: localeNames[value] })}
          </p>
          <Button type="submit" disabled={loading || value === initialLocale}>
            {loading ? tc("saving") : t("saveLanguage")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
