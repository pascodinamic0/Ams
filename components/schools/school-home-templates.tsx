import Link from "next/link";
import type { SchoolRow } from "@/lib/db/schools";
import type { PublicSchoolEvent } from "@/lib/db/public-events";
import { resolveSchoolWebsite } from "@/lib/schools/website-content";
import { PublicEventsSection } from "./public-events-section";

function AdmissionsCta({
  slug,
  label = "Apply for Admissions",
  className = "",
  style,
  isPreview = false,
}: {
  slug: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  isPreview?: boolean;
}) {
  if (isPreview) {
    return (
      <span className={className} style={style}>
        {label}
      </span>
    );
  }

  return (
    <Link href={`/schools/${slug}/enroll`} className={className} style={style}>
      {label}
    </Link>
  );
}

function ContactBlock({ school }: { school: SchoolRow }) {
  return (
    <div className="space-y-3 text-sm">
      {school.contact_email && (
        <p>
          <span className="font-medium">Email:</span>{" "}
          <a href={`mailto:${school.contact_email}`} className="hover:underline">
            {school.contact_email}
          </a>
        </p>
      )}
      {school.contact_phone && (
        <p>
          <span className="font-medium">Phone:</span> {school.contact_phone}
        </p>
      )}
      {school.address && <p>{school.address}</p>}
      {!school.contact_email && !school.contact_phone && !school.address && (
        <p className="text-stone-500">Contact details coming soon.</p>
      )}
    </div>
  );
}

function StatsStrip({
  stats,
  primary,
  variant = "modern",
}: {
  stats: { label: string; value: string }[];
  primary: string;
  variant?: "modern" | "classic" | "minimal";
}) {
  if (stats.length === 0) return null;

  return (
    <section
      className={
        variant === "classic"
          ? "border-y-2 border-stone-300 bg-white py-10 dark:border-stone-700 dark:bg-stone-950"
          : variant === "minimal"
            ? "py-12"
            : "rounded-2xl bg-stone-900 px-6 py-10 text-white"
      }
    >
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p
              className="text-3xl font-bold tracking-tight"
              style={variant !== "modern" ? { color: primary } : undefined}
            >
              {stat.value}
            </p>
            <p
              className={
                variant === "modern"
                  ? "mt-1 text-sm text-stone-400"
                  : "mt-1 text-sm text-stone-600 dark:text-stone-400"
              }
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProgramsSection({
  programs,
  primary,
  variant = "modern",
}: {
  programs: { title: string; description: string; image_url: string }[];
  primary: string;
  variant?: "modern" | "classic" | "minimal";
}) {
  if (programs.length === 0) return null;

  return (
    <section className="scroll-mt-24" id="programs">
      <h2
        className={
          variant === "classic"
            ? "font-serif text-3xl font-bold"
            : variant === "minimal"
              ? "text-xs font-medium uppercase tracking-[0.2em] text-stone-400"
              : "text-3xl font-bold tracking-tight"
        }
        style={variant === "classic" ? { color: primary } : undefined}
      >
        {variant === "minimal" ? "Programs" : "Our Programs"}
      </h2>
      <div
        className={
          variant === "minimal"
            ? "mt-10 space-y-12"
            : "mt-8 grid gap-8 md:grid-cols-3"
        }
      >
        {programs.map((program, i) => (
          <article
            key={program.title}
            className={
              variant === "classic"
                ? "overflow-hidden border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950"
                : variant === "minimal"
                  ? "grid gap-6 md:grid-cols-[140px_1fr]"
                  : "overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950"
            }
          >
            <img
              src={program.image_url}
              alt={program.title}
              className={
                variant === "minimal"
                  ? "h-32 w-full rounded-lg object-cover md:h-full md:min-h-[120px]"
                  : "h-44 w-full object-cover"
              }
            />
            <div className={variant === "minimal" ? "" : "p-5"}>
              <h3
                className={
                  variant === "classic"
                    ? "font-serif text-lg font-semibold"
                    : "text-lg font-semibold"
                }
                style={variant === "classic" ? { color: primary } : undefined}
              >
                {program.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {program.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GallerySection({
  gallery,
  variant = "modern",
}: {
  gallery: { url: string; caption?: string }[];
  variant?: "modern" | "classic" | "minimal";
}) {
  if (gallery.length === 0) return null;

  return (
    <section className="scroll-mt-24" id="gallery">
      <h2
        className={
          variant === "classic"
            ? "font-serif text-3xl font-bold text-center"
            : variant === "minimal"
              ? "text-xs font-medium uppercase tracking-[0.2em] text-stone-400"
              : "text-3xl font-bold tracking-tight"
        }
      >
        {variant === "minimal" ? "Campus life" : "Life at our school"}
      </h2>
      <div
        className={
          variant === "minimal"
            ? "mt-8 grid grid-cols-2 gap-3"
            : "mt-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        }
      >
        {gallery.map((item, i) => (
          <figure key={`${item.url}-${i}`} className="group overflow-hidden rounded-xl">
            <img
              src={item.url}
              alt={item.caption ?? "Campus"}
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {item.caption && variant !== "minimal" && (
              <figcaption className="mt-2 text-center text-xs text-stone-500">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

function ModernTemplate({
  school,
  events = [],
  isPreview = false,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
}) {
  const primary = school.theme_primary_color ?? "#0d9488";
  const secondary = school.theme_secondary_color ?? "#7c3aed";
  const site = resolveSchoolWebsite(school);

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl">
        <img
          src={site.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${primary}dd, ${secondary}cc)`,
          }}
        />
        <div className="relative px-8 py-24 text-white md:py-32">
          <div className="mx-auto max-w-4xl">
            {school.logo_url && (
              <img
                src={school.logo_url}
                alt=""
                className="mb-6 h-16 w-16 rounded-2xl bg-white/10 object-cover ring-2 ring-white/20"
              />
            )}
            <p className="text-sm font-medium uppercase tracking-widest text-white/80">
              {school.name}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
              {site.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
              {site.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <AdmissionsCta
                slug={school.slug}
                isPreview={isPreview}
                className="inline-flex items-center rounded-xl bg-white px-7 py-3.5 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
                style={{ color: primary }}
              />
              <a
                href="#programs"
                className="inline-flex items-center rounded-xl border-2 border-white/40 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Explore programs
              </a>
            </div>
          </div>
        </div>
      </section>

      <StatsStrip stats={site.stats} primary={primary} variant="modern" />

      <ProgramsSection programs={site.programs} primary={primary} variant="modern" />

      <section id="about" className="scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">About us</h2>
            <p className="mt-4 leading-relaxed text-stone-600 dark:text-stone-400">
              {site.about}
            </p>
          </div>
          {site.gallery[0] && (
            <img
              src={site.gallery[0].url}
              alt="About"
              className="rounded-2xl object-cover shadow-lg aspect-[4/3] w-full"
            />
          )}
        </div>
      </section>

      <GallerySection gallery={site.gallery} variant="modern" />

      {!isPreview && events.length > 0 && (
        <PublicEventsSection events={events} slug={school.slug} primary={primary} />
      )}

      <section
        id="contact"
        className="scroll-mt-24 rounded-2xl border border-zinc-100 bg-stone-50 p-8 dark:border-stone-800 dark:bg-stone-900/50 md:p-12"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Get in touch</h2>
            <p className="mt-2 text-stone-600 dark:text-stone-400">
              We would love to hear from prospective families.
            </p>
            <div className="mt-6">
              <ContactBlock school={school} />
            </div>
          </div>
          <div
            className="flex flex-col justify-center rounded-xl p-8 text-white"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
          >
            <h3 className="text-xl font-semibold">Ready to join us?</h3>
            <p className="mt-2 text-white/90">
              Start your application online. Our admissions team will guide you
              through every step.
            </p>
            <AdmissionsCta
              slug={school.slug}
              isPreview={isPreview}
              label="Start application"
              className="mt-6 inline-flex w-fit items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold"
              style={{ color: primary }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ClassicTemplate({
  school,
  events = [],
  isPreview = false,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
}) {
  const primary = school.theme_primary_color ?? "#1e3a8a";
  const site = resolveSchoolWebsite(school);

  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative border-2 border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950">
        <div className="relative h-72 overflow-hidden md:h-96">
          <img src={site.heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
            {school.logo_url && (
              <img
                src={school.logo_url}
                alt=""
                className="mb-4 h-20 w-20 rounded-full border-4 border-white object-cover"
              />
            )}
            <h1 className="font-serif text-4xl font-bold tracking-wide md:text-5xl">
              {site.heroTitle}
            </h1>
            <p className="mt-3 max-w-xl font-serif text-lg italic text-white/90">
              {site.heroSubtitle}
            </p>
          </div>
        </div>

        <StatsStrip stats={site.stats} primary={primary} variant="classic" />

        <div className="p-8 md:p-12">
          <ProgramsSection programs={site.programs} primary={primary} variant="classic" />
        </div>

        <section id="about" className="scroll-mt-24 border-t border-stone-300 p-8 md:p-12 dark:border-stone-700">
          <h2 className="font-serif text-3xl font-bold" style={{ color: primary }}>
            About our school
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-stone-700 dark:text-stone-300">
            {site.about}
          </p>
        </section>

        <div className="border-t border-stone-300 p-8 md:p-12 dark:border-stone-700">
          <GallerySection gallery={site.gallery} variant="classic" />
        </div>

        {!isPreview && events.length > 0 && (
          <div className="border-t border-stone-300 p-8 md:p-12 dark:border-stone-700">
            <PublicEventsSection events={events} slug={school.slug} primary={primary} />
          </div>
        )}

        <section
          id="contact"
          className="scroll-mt-24 grid border-t border-stone-300 md:grid-cols-2 dark:border-stone-700"
        >
          <div className="border-b border-stone-300 p-8 md:border-b-0 md:border-r dark:border-stone-700">
            <h2 className="font-serif text-2xl font-semibold">Contact</h2>
            <div className="mt-4 text-stone-700 dark:text-stone-300">
              <ContactBlock school={school} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="font-serif text-2xl font-semibold" style={{ color: primary }}>
              Admissions
            </h2>
            <p className="mt-3 max-w-sm text-stone-600 dark:text-stone-400">
              Begin your journey with {school.name} today.
            </p>
            <AdmissionsCta
              slug={school.slug}
              isPreview={isPreview}
              className="mt-6 inline-block rounded px-10 py-3.5 font-serif font-medium text-white"
              style={{ backgroundColor: primary }}
            />
          </div>
        </section>
      </section>
    </div>
  );
}

function MinimalTemplate({
  school,
  events = [],
  isPreview = false,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
}) {
  const primary = school.theme_primary_color ?? "#18181b";
  const site = resolveSchoolWebsite(school);

  return (
    <div className="mx-auto max-w-2xl space-y-16 px-2 py-4">
      <section>
        <img
          src={site.heroImage}
          alt=""
          className="mb-10 aspect-[16/10] w-full rounded-sm object-cover"
        />
        {school.logo_url && (
          <img src={school.logo_url} alt="" className="mb-6 h-12 w-12 object-cover" />
        )}
        <h1 className="text-4xl font-light tracking-tight md:text-5xl" style={{ color: primary }}>
          {site.heroTitle}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-600 dark:text-stone-400">
          {site.heroSubtitle}
        </p>
        <AdmissionsCta
          slug={school.slug}
          isPreview={isPreview}
          label="Apply"
          className="mt-8 inline-block border-2 px-8 py-3 text-sm font-medium tracking-wide"
          style={{ borderColor: primary, color: primary }}
        />
      </section>

      <StatsStrip stats={site.stats} primary={primary} variant="minimal" />

      <ProgramsSection programs={site.programs} primary={primary} variant="minimal" />

      <section id="about" className="scroll-mt-24 border-t border-stone-200 pt-12 dark:border-stone-800">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">About</h2>
        <p className="mt-6 leading-relaxed text-stone-600 dark:text-stone-400">{site.about}</p>
      </section>

      <GallerySection gallery={site.gallery} variant="minimal" />

      {!isPreview && events.length > 0 && (
        <PublicEventsSection events={events} slug={school.slug} primary={primary} />
      )}

      <section id="contact" className="scroll-mt-24 border-t border-stone-200 pt-12 dark:border-stone-800">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">Contact</h2>
        <div className="mt-6 text-stone-600 dark:text-stone-400">
          <ContactBlock school={school} />
        </div>
      </section>
    </div>
  );
}

export function SchoolHomeTemplate({
  school,
  events = [],
  isPreview = false,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
}) {
  const template = school.website_template ?? "modern";

  switch (template) {
    case "classic":
      return <ClassicTemplate school={school} events={events} isPreview={isPreview} />;
    case "minimal":
      return <MinimalTemplate school={school} events={events} isPreview={isPreview} />;
    default:
      return <ModernTemplate school={school} events={events} isPreview={isPreview} />;
  }
}
