import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { OnlineEnrollmentForm } from "@/components/schools/online-enrollment-form";
import { SchoolInnerPage } from "@/components/schools/school-inner-page";
import { getSchoolBySlug, getPublicClassesForSchool } from "@/lib/db";
import { getCampusVisitSlots } from "@/lib/db/public-events";

export default async function SchoolEnrollPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  const t = await getTranslations("schools.enrollment");
  const tChrome = await getTranslations("schools.chrome");
  const campusVisitSlots = await getCampusVisitSlots(school.id);
  const publicClasses = await getPublicClassesForSchool(school.id);
  const hasVisitSlots = campusVisitSlots.length > 0;

  return (
    <SchoolInnerPage
      school={school}
      title={t("onlineEnrollment")}
      description={
        hasVisitSlots
          ? t("submitDetailsForThenBook", { schoolName: school.name })
          : t("submitDetailsForThenVisit", { schoolName: school.name })
      }
      backHref={`/schools/${slug}`}
      backLabel={tChrome("backToSchoolName", { schoolName: school.name })}
    >
      <OnlineEnrollmentForm
        schoolId={school.id}
        schoolName={school.name}
        slug={slug}
        schoolAddress={school.address}
        primary={school.theme_primary_color ?? "#0d9488"}
        campusVisitSlots={campusVisitSlots}
        classes={publicClasses}
        hideIntro
      />
    </SchoolInnerPage>
  );
}
