import { notFound } from "next/navigation";
import { SchoolSiteLayout } from "@/components/schools/school-site-layout";
import { getSchoolBySlug } from "@/lib/db";

export default async function SchoolPublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);

  if (!school) {
    notFound();
  }

  return <SchoolSiteLayout school={school}>{children}</SchoolSiteLayout>;
}
