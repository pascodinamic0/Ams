import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { formatBlogDate, getBlogPosts } from "@/lib/company/blog";

export async function BlogIndexPage() {
  const t = await getTranslations("blog");
  const locale = await getLocale();
  const posts = getBlogPosts(t);

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

        <div className="mt-12 space-y-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block border border-mkt-ink/10 p-6 transition-colors hover:border-mkt-ink/25 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink/40">
                <time dateTime={post.date}>
                  {formatBlogDate(post.date, locale)}
                </time>
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
                {t("index.readArticle")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
