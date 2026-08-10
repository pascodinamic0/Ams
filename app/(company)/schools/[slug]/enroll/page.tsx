import { notFound } from "next/navigation";
import { OnlineEnrollmentForm } from "@/components/schools/online-enrollment-form";
import { SchoolInnerPage } from "@/components/schools/school-inner-page";
import { getSchoolBySlug } from "@/lib/db";
import { getCampusVisitSlots } from "@/lib/db/public-events";

export default async function SchoolEnrollPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  const campusVisitSlots = await getCampusVisitSlots(school.id);
  const hasVisitSlots = campusVisitSlots.length > 0;

  return (
    <SchoolInnerPage
      school={school}
      title="Online enrollment"
      description={
        hasVisitSlots
          ? `Submit your details for ${school.name}, then book a campus visit to complete enrollment in person.`
          : `Submit your details for ${school.name}, then visit the campus to complete enrollment in person.`
      }
      backHref={`/schools/${slug}`}
      backLabel={`Back to ${school.name}`}
    >
      <OnlineEnrollmentForm
        schoolId={school.id}
        schoolName={school.name}
        slug={slug}
        schoolAddress={school.address}
        primary={school.theme_primary_color ?? "#0d9488"}
        campusVisitSlots={campusVisitSlots}
        hideIntro
      />
    </SchoolInnerPage>
  );
}
