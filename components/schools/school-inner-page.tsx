import Link from "next/link";
import type { SchoolRow } from "@/lib/db/schools";
import { resolveSchoolWebsite } from "@/lib/schools/website-content";
import type { WebsiteTemplateId } from "@/lib/schools/website-templates";

type SchoolInnerPageProps = {
  school: SchoolRow;
  title: string;
  description?: string;
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
};

export function SchoolInnerPage({
  school,
  title,
  description,
  backHref,
  backLabel,
  children,
}: SchoolInnerPageProps) {
  const primary = school.theme_primary_color ?? "#0d9488";
  const template = (school.website_template ?? "modern") as WebsiteTemplateId;
  const site = resolveSchoolWebsite(school);
  const heroImage = school.cover_image_url ?? site.heroImage;

  const titleClass =
    template === "classic"
      ? "font-serif text-2xl font-bold sm:text-3xl md:text-4xl"
      : template === "minimal"
        ? "font-editorial text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
        : "text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl";

  return (
    <div className="relative">
      {heroImage ? (
        <>
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/50" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${primary} 0%, ${primary}cc 55%, ${primary}99 100%)`,
          }}
        />
      )}

      <section className="relative pt-24 pb-6 sm:pt-28 sm:pb-8 md:pt-32 md:pb-10">
        <div className="mx-auto max-w-4xl px-4 text-white sm:px-6">
          <Link
            href={backHref}
            className="inline-flex items-center text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            &larr; {backLabel}
          </Link>
          <h1 className={`mt-4 ${titleClass}`}>{title}</h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
              {description}
            </p>
          )}
        </div>
      </section>

      <div className="relative mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="rounded-2xl bg-white/92 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)] ring-1 ring-white/40 backdrop-blur-md sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
