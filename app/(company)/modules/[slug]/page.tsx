import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ModuleDetailPage } from "@/components/company/module-detail-page";
import { companyIdentity } from "@/lib/company/identity";
import { getPlatformModule, platformModules } from "@/lib/company/modules";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return platformModules.map((module) => ({ slug: module.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const module = getPlatformModule(slug);

  if (!module) {
    return { title: "Module not found" };
  }

  return {
    title: `${module.title} | ${companyIdentity.productName}`,
    description: module.summary,
  };
}

export default async function ModulePage(props: PageProps) {
  const { slug } = await props.params;
  const module = getPlatformModule(slug);

  if (!module) {
    notFound();
  }

  return <ModuleDetailPage module={module} />;
}
