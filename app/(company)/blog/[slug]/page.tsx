import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogArticlePage } from "@/components/company/blog-article-page";
import { companyIdentity } from "@/lib/company/identity";
import {
  getBlogPost,
  getBlogPostSlugs,
} from "@/lib/company/blog";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations("blog");
  const post = getBlogPost(slug, t);

  if (!post) {
    return { title: "Article not found" };
  }

  return {
    title: `${post.title} | ${companyIdentity.productName}`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.date,
      images: [{ url: post.coverImage, width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage(props: PageProps) {
  const { slug } = await props.params;
  const t = await getTranslations("blog");
  const post = getBlogPost(slug, t);

  if (!post) {
    notFound();
  }

  return <BlogArticlePage post={post} />;
}
