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
        <div
          className="relative z-40 border-b px-6 py-3 text-center text-sm"
          style={{
            backgroundColor: "#f7f4ea",
            borderColor: "#e7d9a8",
            color: "#1a2b56",
          }}
        >
          Template preview — sample content only.{" "}
          <Link
            href="/get-access"
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
