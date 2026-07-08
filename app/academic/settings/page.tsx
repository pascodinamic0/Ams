import { SchoolCurrencyForm } from "@/components/schools/school-currency-form";
import { getCurrentProfile } from "@/lib/auth/session";
import { getSchoolById } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export default async function AcademicSettingsPage() {
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

  const school = await getSchoolById(profile.school_id);
  if (!school) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="text-lg font-semibold">{t("schoolNotFound")}</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("settingsTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("settingsDescription")}
        </p>
      </div>

      <SchoolCurrencyForm
        schoolId={school.id}
        currencyCode={school.currency_code}
        title={t("currencyTitle")}
        description={t("currencyDescription")}
      />
    </div>
  );
}
