import { getTranslations } from "next-intl/server";
import { ReleaseQueue } from "@/components/admin/release-queue";
import { getCurrentProfile } from "@/lib/auth/session";
import { isPlatformOwner } from "@/lib/features/owner";
import { getProductReleases } from "@/lib/db/releases";

export default async function ReleasesPage() {
  const t = await getTranslations("admin");
  const [releases, profile] = await Promise.all([
    getProductReleases(),
    getCurrentProfile(),
  ]);
  const canManage = isPlatformOwner(profile?.email, profile?.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          {t("releasesTitle")}
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">{t("releasesSubtitle")}</p>
      </div>
      <ReleaseQueue releases={releases} canManage={canManage} />
    </div>
  );
}
