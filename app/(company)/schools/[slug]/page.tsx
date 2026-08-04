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

  return <SchoolHomeTemplate school={school} events={events} />;
}
