import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ModuleDetailPage } from "@/components/company/module-detail-page";
import { companyIdentity } from "@/lib/company/identity";
import { getPlatformModule, getPlatformModules } from "@/lib/i18n/modules";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [
    { slug: "academic" },
    { slug: "finance" },
    { slug: "operations" },
    { slug: "analytics" },
    { slug: "school-websites" },
    { slug: "messaging" },
    { slug: "parent-student-portals" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations("modules");
  const module = getPlatformModule(slug, t);

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
  const t = await getTranslations("modules");
  const module = getPlatformModule(slug, t);

  if (!module) {
    notFound();
  }

  return <ModuleDetailPage module={module} />;
}
