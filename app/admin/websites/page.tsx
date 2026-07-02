import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { WebsiteTemplatesGallery } from "./template-gallery";

export default async function AdminWebsitesPage() {
  const t = await getTranslations("admin");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("websitesPageTitle")}</h1>
          <p className="mt-2 max-w-2xl text-stone-600 dark:text-stone-400">
            {t("websitesSubtitle")}
          </p>
        </div>
        <Link href="/admin/schools/new">
          <Button>{t("onboardSchool")}</Button>
        </Link>
      </div>

      <WebsiteTemplatesGallery />
    </div>
  );
}
