import { notFound } from "next/navigation";
import { SchoolHomeTemplate } from "@/components/schools/school-home-templates";
import { getSchoolBySlug } from "@/lib/db";
import { getPublicSchoolEvents } from "@/lib/db/public-events";

export default async function SchoolHomepage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);

  if (!school) {
    notFound();
  }

  const events = await getPublicSchoolEvents(school.id, { limit: 6 });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <SchoolHomeTemplate school={school} events={events} />
    </div>
  );
}
