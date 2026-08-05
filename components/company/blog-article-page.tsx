import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { BlogPost } from "@/lib/company/blog";
import { formatBlogDate } from "@/lib/company/blog";

const MID_CTA_AFTER_SECTION = 3;

export async function BlogArticlePage({ post }: { post: BlogPost }) {
  const t = await getTranslations("blog");
  const locale = await getLocale();

  return (
    <article className="min-h-screen bg-mkt-canvas pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mkt-ink/50 transition-colors hover:text-mkt-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("index.backToBlog")}
        </Link>

        <header className="mt-8 border-b border-mkt-ink/10 pb-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink/40">
            <time dateTime={post.date}>
              {formatBlogDate(post.date, locale)}
            </time>
            <span aria-hidden className="text-mkt-ink/20">
              ·
            </span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="mt-5 font-display text-3xl tracking-tight text-mkt-ink md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-mkt-ink/55 sm:text-lg">
            {post.excerpt}
          </p>
        </header>

        <div className="mt-10 space-y-5">
          {post.intro.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="text-base leading-relaxed text-mkt-ink/65 sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-14 space-y-14">
          {post.sections.map((section, index) => (
            <div key={section.title}>
              <section className="space-y-6">
                <h2 className="font-display text-2xl tracking-tight text-mkt-ink md:text-3xl">
                  <span className="mr-3 text-amber-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>

                <div className="space-y-5 border-l border-mkt-ink/10 pl-5 sm:pl-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
                      {section.costLabel}
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-mkt-ink/60">
                      {section.cost}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
                      {section.fixLabel}
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-mkt-ink/60">
                      {section.fix}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
                      {section.whoLabel}
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-mkt-ink/60">
                      {section.who}
                    </p>
                  </div>
                </div>
              </section>

              {index + 1 === MID_CTA_AFTER_SECTION && (
                <aside className="mt-14 border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
                  <h3 className="font-display text-xl tracking-tight text-mkt-ink">
                    {post.midCtaTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mkt-ink/60 sm:text-base">
                    {post.midCtaBody}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/get-access"
                      className="inline-flex items-center justify-center rounded-full bg-mkt-inverse px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-mkt-inverse-ink transition-transform hover:scale-[1.02]"
                    >
                      {post.midCtaPrimary}
                    </Link>
                    <Link
                      href="/features"
                      className="inline-flex items-center justify-center rounded-full border border-mkt-ink/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
                    >
                      {post.midCtaSecondary}
                    </Link>
                  </div>
                </aside>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 space-y-5 border-t border-mkt-ink/10 pt-10">
          {post.closing.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="text-base leading-relaxed text-mkt-ink/65 sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/get-access"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-mkt-inverse px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-mkt-inverse-ink transition-transform hover:scale-[1.02]"
          >
            {post.ctaPrimary}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center justify-center rounded-full border border-mkt-ink/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
          >
            {post.ctaSecondary}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-mkt-ink/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
          >
            {post.ctaTertiary}
          </Link>
        </div>

        <nav
          aria-label={post.relatedLabel}
          className="mt-14 border-t border-mkt-ink/10 pt-10"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            {post.relatedLabel}
          </p>
          <ul className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <li>
              <Link
                href="/modules/finance"
                className="inline-flex border border-mkt-ink/10 px-4 py-3 text-sm font-medium text-mkt-ink/65 transition-colors hover:border-mkt-ink/25 hover:text-mkt-ink"
              >
                {post.relatedFinance}
              </Link>
            </li>
            <li>
              <Link
                href="/modules/academic"
                className="inline-flex border border-mkt-ink/10 px-4 py-3 text-sm font-medium text-mkt-ink/65 transition-colors hover:border-mkt-ink/25 hover:text-mkt-ink"
              >
                {post.relatedAcademic}
              </Link>
            </li>
            <li>
              <Link
                href="/modules/parent-student-portals"
                className="inline-flex border border-mkt-ink/10 px-4 py-3 text-sm font-medium text-mkt-ink/65 transition-colors hover:border-mkt-ink/25 hover:text-mkt-ink"
              >
                {post.relatedPortals}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </article>
  );
}
