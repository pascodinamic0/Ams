import { notFound } from "next/navigation";
import { OnlineEnrollmentForm } from "@/components/schools/online-enrollment-form";
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

  return (
    <div className="px-6 py-12">
      <OnlineEnrollmentForm
        schoolId={school.id}
        schoolName={school.name}
        slug={slug}
        schoolAddress={school.address}
        primary={school.theme_primary_color ?? "#0d9488"}
        campusVisitSlots={campusVisitSlots}
      />
    </div>
  );
}
