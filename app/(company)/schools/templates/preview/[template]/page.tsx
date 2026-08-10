import { notFound } from "next/navigation";
import { SchoolHomeTemplate } from "@/components/schools/school-home-templates";
import { SchoolSiteLayout } from "@/components/schools/school-site-layout";
import { TemplatePreviewBanner } from "@/components/schools/template-preview-banner";
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
      {!isEmbed && <TemplatePreviewBanner template={template} />}
      <SchoolHomeTemplate school={school} isPreview />
    </SchoolSiteLayout>
  );
}
