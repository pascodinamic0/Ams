import { Button } from "@/components/ui/button";
import { WebsiteEditorForm } from "@/components/schools/website-editor-form";
import { getCurrentProfile } from "@/lib/auth/session";
import { getSchoolById } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export default async function AcademicWebsitePage() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();

  if (!profile?.school_id) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-lg font-semibold">{t("noSchoolLinked")}</h1>
        <p className="mt-2 text-sm">{t("noSchoolLinkedDesc")}</p>
      </div>
    );
  }

  const school = await getSchoolById(profile.school_id!);

  if (!school) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="text-lg font-semibold">{t("schoolNotFound")}</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("websiteTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {t("websiteDescription")}
          </p>
        </div>
        {school.public_site_enabled && (
          <a href={`/schools/${school.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">{t("previewSite")}</Button>
          </a>
        )}
      </div>

      <WebsiteEditorForm school={school} />
    </div>
  );
}
