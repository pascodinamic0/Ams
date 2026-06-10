import { notFound } from "next/navigation";
import { PublicAdmissionForm } from "@/components/schools/public-admission-form";
import { getSchoolBySlug } from "@/lib/db";

export default async function PublicAdmissionsPage({
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
    <PublicAdmissionForm
      schoolId={school.id}
      schoolName={school.name}
      slug={slug}
    />
  );
}
