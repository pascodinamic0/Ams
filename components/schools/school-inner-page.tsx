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
      ? "font-serif text-3xl font-bold md:text-4xl"
      : template === "minimal"
        ? "font-editorial text-3xl font-semibold tracking-tight md:text-4xl"
        : "text-3xl font-bold tracking-tight md:text-4xl";

  return (
    <div>
      <section className="relative overflow-hidden pt-28 pb-12 md:pt-32 md:pb-16">
        {heroImage ? (
          <>
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/35" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)`,
            }}
          />
        )}
        <div className="relative mx-auto max-w-4xl px-6 text-white">
          <Link
            href={backHref}
            className="inline-flex items-center text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            &larr; {backLabel}
          </Link>
          <h1 className={`mt-4 ${titleClass}`}>{title}</h1>
          {description && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
              {description}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12">{children}</div>
    </div>
  );
}
