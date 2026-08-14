import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { companyIdentity } from "@/lib/company/identity";
import type { MoneyPageContent } from "@/lib/company/money-page-content";

export function MoneyPage({ content }: { content: MoneyPageContent }) {
  return (
    <div className="min-h-screen bg-mkt-canvas pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink/40">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-mkt-ink">
                {content.locale === "fr" ? "Accueil" : "Home"}
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li className="text-mkt-ink/60">{content.eyebrow}</li>
          </ol>
        </nav>

        <header className="mt-8 border-b border-mkt-ink/10 pb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-3xl tracking-tight text-mkt-ink md:text-5xl">
            {content.headline}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-mkt-ink/55 sm:text-lg">
            {content.subtitle}
          </p>
        </header>

        <div className="mt-12 space-y-10">
          {content.sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="font-display text-2xl tracking-tight text-mkt-ink">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="flex items-start gap-3 text-base leading-relaxed text-mkt-ink/65"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-amber-500" aria-hidden />
                  <span>{paragraph}</span>
                </p>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                {section.moduleHref && section.moduleLabel ? (
                  <Link
                    href={section.moduleHref}
                    className="inline-flex border border-mkt-ink/10 px-4 py-2 text-sm font-medium text-mkt-ink/65 transition-colors hover:border-mkt-ink/25 hover:text-mkt-ink"
                  >
                    {section.moduleLabel}
                  </Link>
                ) : null}
                {section.blogHref && section.blogLabel ? (
                  <Link
                    href={section.blogHref}
                    className="inline-flex border border-mkt-ink/10 px-4 py-2 text-sm font-medium text-mkt-ink/65 transition-colors hover:border-mkt-ink/25 hover:text-mkt-ink"
                  >
                    {section.blogLabel}
                  </Link>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <aside className="mt-14 border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            {companyIdentity.productName}
          </p>
          <p className="mt-3 text-base leading-relaxed text-mkt-ink/70">
            {content.locale === "fr"
              ? "Une après-midi pour mettre frais, notes et parents au même endroit  avant le prochain trimestre."
              : "One afternoon to put fees, grades, and parents in one place  before the next term locks in the same leaks."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/get-access"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-mkt-inverse px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-mkt-inverse-ink transition-transform hover:scale-[1.02]"
            >
              {content.ctaPrimary}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-full border border-mkt-ink/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
            >
              {content.ctaSecondary}
            </Link>
            <Link
              href={content.locale === "fr" ? "/contact" : companyIdentity.contact.whatsappUrl}
              className="inline-flex items-center justify-center rounded-full border border-mkt-ink/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
            >
              {content.ctaTertiary}
            </Link>
          </div>
        </aside>

        <nav className="mt-14 border-t border-mkt-ink/10 pt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            {content.relatedBlogLabel}
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {content.relatedBlogLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-mkt-ink/65 transition-colors hover:text-amber-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
