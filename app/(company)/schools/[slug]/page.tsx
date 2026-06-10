import { notFound } from "next/navigation";
import { SchoolHomeTemplate } from "@/components/schools/school-home-templates";
import { getSchoolBySlug } from "@/lib/db";

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

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <SchoolHomeTemplate school={school} />
    </div>
  );
}
