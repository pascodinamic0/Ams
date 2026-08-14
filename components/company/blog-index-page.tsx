import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import {
  BLOG_CATEGORY_LABELS,
  formatBlogDate,
  getBlogPosts,
  type BlogCategory,
  type BlogPost,
} from "@/lib/company/blog";

const CATEGORY_ORDER: BlogCategory[] = [
  "guides",
  "fees",
  "attendance",
  "drc",
  "francais",
  "conversion",
];

function isBlogCategory(value: string | undefined): value is BlogCategory {
  return CATEGORY_ORDER.includes(value as BlogCategory);
}

export async function BlogIndexPage({
  activeCategory,
}: {
  activeCategory?: string;
}) {
  const t = await getTranslations("blog");
  const locale = await getLocale();
  const selectedCategory = isBlogCategory(activeCategory) ? activeCategory : null;

  const allPosts = getBlogPosts(t, locale);
  const posts = selectedCategory
    ? allPosts.filter((post) => post.category === selectedCategory)
    : allPosts;

  return (
    <div className="min-h-screen bg-mkt-canvas pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-mkt-ink/60">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
          {t("index.eyebrow")}
        </p>
        <h1 className="mt-5 font-display text-3xl tracking-tight text-mkt-ink md:text-5xl">
          {t("index.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-mkt-ink/55 sm:text-lg">
          {t("index.subtitle")}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              !selectedCategory
                ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                : "border-mkt-ink/15 text-mkt-ink/50 hover:border-mkt-ink/30 hover:text-mkt-ink"
            }`}
          >
            {t("index.allCategories")}
          </Link>
          {CATEGORY_ORDER.map((category) => {
            const label =
              locale === "fr"
                ? BLOG_CATEGORY_LABELS[category].fr
                : BLOG_CATEGORY_LABELS[category].en;
            const isActive = selectedCategory === category;
            return (
              <Link
                key={category}
                href={`/blog?category=${category}`}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                    : "border-mkt-ink/15 text-mkt-ink/50 hover:border-mkt-ink/30 hover:text-mkt-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-b border-mkt-ink/10 pb-8">
          <Link
            href="/school-management-system"
            className="text-sm font-medium text-amber-500 transition-colors hover:text-amber-400"
          >
            {t("index.moneyPageEn")}
          </Link>
          <span className="text-mkt-ink/20" aria-hidden>
            ·
          </span>
          <Link
            href="/logiciel-de-gestion-scolaire"
            className="text-sm font-medium text-amber-500 transition-colors hover:text-amber-400"
          >
            {t("index.moneyPageFr")}
          </Link>
        </div>

        <div className="mt-12 space-y-3">
          {posts.map((post) => (
            <BlogPostCard
              key={post.slug}
              post={post}
              locale={locale}
              readLabel={t("index.readArticle")}
            />
          ))}
          {posts.length === 0 ? (
            <p className="text-sm text-mkt-ink/50">{t("index.noPostsInCategory")}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BlogPostCard({
  post,
  locale,
  readLabel,
}: {
  post: BlogPost;
  locale: string;
  readLabel: string;
}) {
  const categoryLabel =
    locale === "fr"
      ? BLOG_CATEGORY_LABELS[post.category].fr
      : BLOG_CATEGORY_LABELS[post.category].en;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border border-mkt-ink/10 transition-colors hover:border-mkt-ink/25"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-mkt-ink/5">
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt ?? ""}
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink/40">
          <span className="text-amber-500">{categoryLabel}</span>
          <span aria-hidden className="text-mkt-ink/20">
            ·
          </span>
          <time dateTime={post.date}>{formatBlogDate(post.date, locale)}</time>
          <span aria-hidden className="text-mkt-ink/20">
            ·
          </span>
          <span>{post.readTime}</span>
        </div>
        <h2 className="mt-4 font-display text-xl tracking-tight text-mkt-ink transition-colors group-hover:text-amber-500 sm:text-2xl">
          {post.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mkt-ink/50 sm:text-base">
          {post.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-500">
          {readLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
