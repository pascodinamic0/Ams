import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogIndexPage } from "@/components/company/blog-index-page";
import { companyIdentity } from "@/lib/company/identity";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");

  return {
    title: `${t("index.eyebrow")} | ${companyIdentity.productName}`,
    description: t("index.subtitle"),
  };
}

export default function BlogPage() {
  return <BlogIndexPage />;
}
