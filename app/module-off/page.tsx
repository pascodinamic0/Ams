import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { getDashboardForRole } from "@/lib/auth/rbac";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function ModuleOffPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const t = await getTranslations("billing");
  const tAdmin = await getTranslations("admin");
  const profile = await getCurrentProfile();
  const params = await searchParams;
  const dashboard = getDashboardForRole(profile?.role);
  const moduleKey = params.module ?? "";
  const moduleLabel =
    moduleKey && tAdmin.has(`features.${moduleKey}.label`)
      ? tAdmin(`features.${moduleKey}.label`)
      : t("moduleOffGeneric");

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
        {t("moduleOffTitle")}
      </h1>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        {t("moduleOffBody", { module: moduleLabel })}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/billing">
          <Button>{t("moduleOffBilling")}</Button>
        </Link>
        <Link href={dashboard}>
          <Button variant="outline">{t("goToDashboard")}</Button>
        </Link>
      </div>
    </div>
  );
}
