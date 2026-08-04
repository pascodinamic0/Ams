import { notFound } from "next/navigation";
import Link from "next/link";
import { SchoolHomeTemplate } from "@/components/schools/school-home-templates";
import { SchoolSiteLayout } from "@/components/schools/school-site-layout";
import { createDemoSchool } from "@/lib/schools/demo-school";
import { isWebsiteTemplateId } from "@/lib/schools/website-templates";

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ template: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { template } = await params;
  const { embed } = await searchParams;
  const isEmbed = embed === "1";

  if (!isWebsiteTemplateId(template)) {
    notFound();
  }

  const school = createDemoSchool(template);

  return (
    <SchoolSiteLayout school={school} isPreview>
      {!isEmbed && (
        <div className="border-b border-teal-200 bg-teal-50 px-6 py-3 text-center text-sm text-teal-950">
          Template preview — sample content only.{" "}
          <Link
            href={`/admin/schools/new?template=${template}`}
            className="font-semibold underline underline-offset-2"
          >
            Use this design before another school claims the look
          </Link>
        </div>
      )}
      <SchoolHomeTemplate school={school} isPreview />
    </SchoolSiteLayout>
  );
}
