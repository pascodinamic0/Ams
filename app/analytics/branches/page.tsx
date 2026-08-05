import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function BranchAnalyticsPage() {
  const t = await getTranslations("analytics");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
        {t("branchesTitle")}
      </h1>
      <EmptyState
        title={t("branchesExplainerTitle")}
        description={t("branchesExplainerDesc")}
        action={
          <Link href="/analytics">
            <Button>{t("branchesGoToDashboard")}</Button>
          </Link>
        }
      />
    </div>
  );
}
