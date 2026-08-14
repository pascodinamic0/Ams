import { getTranslations } from "next-intl/server";
import { BlogIndexPage } from "@/components/company/blog-index-page";
import { JsonLdScript } from "@/components/company/json-ld-script";
import { companyIdentity } from "@/lib/company/identity";
import { buildPageMetadata } from "@/lib/company/page-metadata";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/company/seo";

export async function generateMetadata() {
  const t = await getTranslations("blog");

  return buildPageMetadata({
    title: `${t("index.metaTitle")} | ${companyIdentity.productName}`,
    description: t("index.metaDescription"),
    path: "/blog",
  });
}

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const t = await getTranslations("blog");

  return (
    <>
      <JsonLdScript
        data={[
          webPageJsonLd({
            name: t("index.metaTitle"),
            description: t("index.metaDescription"),
            path: "/blog",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <BlogIndexPage activeCategory={category} />
    </>
  );
}
