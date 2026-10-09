import { getTranslations } from "next-intl/server";
import { ReleaseQueue } from "@/components/admin/release-queue";
import { getCurrentProfile } from "@/lib/auth/session";
import { isPlatformOwner } from "@/lib/features/owner";
import { getAwaitingReleases } from "@/lib/db/releases";

export default async function ReleasesPage() {
  const t = await getTranslations("admin");
  const [{ releases, loadError }, profile] = await Promise.all([
    getAwaitingReleases(),
    getCurrentProfile(),
  ]);
  const canManage = isPlatformOwner(profile?.email, profile?.role);
  const isSuperAdmin = profile?.role === "super_admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          {t("releasesTitle")}
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">{t("releasesSubtitle")}</p>
      </div>
      {loadError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {t("releasesLoadError")}
        </div>
      ) : null}
      {isSuperAdmin && !canManage ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
          {t("releasesOwnerOnlyHint")}
        </div>
      ) : null}
      <ReleaseQueue
        releases={releases}
        canManage={canManage}
        emptyHint={loadError ? undefined : t("noReleasesWaitingDetail")}
      />
    </div>
  );
}
