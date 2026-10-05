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
import { SchoolImageUpload } from "@/components/schools/school-image-upload";
import { updateSchool } from "@/lib/actions/schools";
import { toast } from "@/lib/toast";

type Props = {
  schoolId: string;
  schoolName: string;
  logoUrl: string | null;
};

export function SchoolShellBrandingForm({
  schoolId,
  schoolName,
  logoUrl,
}: Props) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const ts = useTranslations("schools.editor");
  const router = useRouter();
  const [logo, setLogo] = useState(logoUrl ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateSchool(schoolId, {
      logo_url: logo.trim() || "",
    });
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("shellBrandingSaved"));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("shellBrandingTitle")}</CardTitle>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("shellBrandingDescription", { schoolName })}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SchoolImageUpload
            schoolId={schoolId}
            folder="logo"
            label={ts("schoolLogo")}
            value={logo}
            onChange={setLogo}
          />
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("shellBrandingHint")}
          </p>
          <Button type="submit" disabled={loading}>
            {loading ? tc("saving") : tc("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
