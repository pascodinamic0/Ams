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
import { updateSchoolDailyReportsEnabled } from "@/lib/actions/schools";
import { toast } from "@/lib/toast";

type Props = {
  schoolId: string;
  enabled: boolean;
};

export function SchoolDailyReportsForm({ schoolId, enabled }: Props) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [dailyEnabled, setDailyEnabled] = useState(enabled);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateSchoolDailyReportsEnabled(schoolId, dailyEnabled);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("dailyReportsUpdated"));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("dailyReportsTitle")}</CardTitle>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("dailyReportsDescription")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              id="daily-reports-enabled"
              type="checkbox"
              checked={dailyEnabled}
              onChange={(e) => setDailyEnabled(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300"
            />
            <div>
              <Label htmlFor="daily-reports-enabled">{t("dailyReportsLabel")}</Label>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {t("dailyReportsHint")}
              </p>
            </div>
          </div>
          <Button type="submit" disabled={loading || dailyEnabled === enabled}>
            {loading ? tc("saving") : t("saveDailyReports")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
