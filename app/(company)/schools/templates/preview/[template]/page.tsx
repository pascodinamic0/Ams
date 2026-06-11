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
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          Template preview - sample content only.{" "}
          <Link
            href={`/admin/schools/new?template=${template}`}
            className="font-semibold underline underline-offset-2"
          >
            Start onboarding with this design
          </Link>
        </div>
      )}
      <div className={isEmbed ? "mx-auto max-w-6xl px-4 py-6" : "mx-auto max-w-6xl px-6 py-12"}>
        <SchoolHomeTemplate school={school} isPreview />
      </div>
    </SchoolSiteLayout>
  );
}
