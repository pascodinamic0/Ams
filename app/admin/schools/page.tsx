import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchools } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { SchoolsTable } from "./schools-table";

export default async function SchoolsPage() {
  const t = await getTranslations("admin");
  const schools = await getSchools();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("schoolsTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t("schoolsBillingHint")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/websites">
            <Button variant="outline">{t("websitesTitle")}</Button>
          </Link>
          <Link href="/admin/schools/new">
            <Button>{t("addSchool")}</Button>
          </Link>
        </div>
      </div>
      {schools.length === 0 ? (
        <EmptyState
          title={t("noSchoolsYet")}
          description={t("noSchoolsDesc")}
          action={
            <Link href="/admin/schools/new">
              <Button>{t("addSchool")}</Button>
            </Link>
          }
        />
      ) : (
        <SchoolsTable schools={schools} />
      )}
    </div>
  );
}
