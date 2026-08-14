import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BlogArticlePage } from "@/components/company/blog-article-page";
import { JsonLdScript } from "@/components/company/json-ld-script";
import { companyIdentity } from "@/lib/company/identity";
import {
  getBlogPost,
  getBlogPostSlugs,
  getBlogPostsBySlugs,
} from "@/lib/company/blog";
import { buildPageMetadata } from "@/lib/company/page-metadata";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/lib/company/seo";
import { getPlatformModule } from "@/lib/i18n/modules";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations("blog");
  const post = getBlogPost(slug, t);

  if (!post) {
    return { title: "Article not found" };
  }

  return buildPageMetadata({
    title: `${post.title} | ${companyIdentity.productName}`,
    description: post.metaDescription,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: post.date,
    images: [post.coverImage],
  });
}

export default async function BlogPostPage(props: PageProps) {
  const { slug } = await props.params;
  const t = await getTranslations("blog");
  const tModules = await getTranslations("modules");
  const post = getBlogPost(slug, t);

  if (!post) {
    notFound();
  }

  const relatedPosts = getBlogPostsBySlugs(post.relatedSlugs, t);
  const relatedModuleLinks = post.relatedModules.flatMap((moduleSlug) => {
    const module = getPlatformModule(moduleSlug, tModules);
    if (!module) return [];
    return [{ href: `/modules/${moduleSlug}`, label: module.title }];
  });

  const faqLd = faqPageJsonLd(post.faq ?? []);
  const jsonLd = [
    blogPostingJsonLd(post),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${slug}` },
    ]),
    ...(faqLd ? [faqLd] : []),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <BlogArticlePage
        post={post}
        relatedPosts={relatedPosts}
        relatedModuleLinks={relatedModuleLinks}
      />
    </>
  );
}
