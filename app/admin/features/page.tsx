import { Suspense } from "react";
import Link from "next/link";
import { getSchoolFeatureMatrix } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { isPlatformOwner } from "@/lib/features/owner";
import { getTranslations } from "next-intl/server";
import { FeatureToggleGrid } from "./feature-toggle-grid";

export default async function FeaturesPage() {
  const t = await getTranslations("admin");
  const [schools, profile] = await Promise.all([
    getSchoolFeatureMatrix(),
    getCurrentProfile(),
  ]);

  const isSuperAdmin = profile?.role === "super_admin";
  const canManage = isPlatformOwner(profile?.email, profile?.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("featuresTitle")}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {isSuperAdmin ? t("featuresSubtitleSuperAdmin") : t("featuresSubtitleSchool")}
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-stone-500 dark:text-stone-400">{t("loadingFeatures")}</p>
        }
      >
        <>
          <FeatureToggleGrid
            schools={schools}
            isSuperAdmin={isSuperAdmin}
            canManage={canManage}
            defaultSchoolId={profile?.school_id}
          />
          {canManage ? (
            <p className="text-sm text-stone-500">
              <Link href="/admin/releases" className="font-medium text-primary hover:underline">
                {t("openReleases")}
              </Link>
            </p>
          ) : null}
        </>
      </Suspense>
    </div>
  );
}
