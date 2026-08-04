import Link from "next/link";
import type { SchoolRow } from "@/lib/db/schools";
import type { PublicSchoolEvent } from "@/lib/db/public-events";
import { resolveSchoolWebsite } from "@/lib/schools/website-content";
import { PublicEventsSection } from "./public-events-section";

function AdmissionsCta({
  slug,
  label = "Apply before seats fill",
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
          ? "border-y py-12"
          : variant === "minimal"
            ? "py-10"
            : "bg-stone-950 px-6 py-12 text-white"
      }
      style={variant === "classic" ? { borderColor: `${primary}33` } : undefined}
    >
      <div
        className={
          variant === "minimal"
            ? "mx-auto grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4"
            : "mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4"
        }
      >
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p
              className={
                variant === "classic"
                  ? "font-serif text-3xl font-bold tracking-tight"
                  : variant === "minimal"
                    ? "font-editorial text-3xl font-semibold tracking-tight"
                    : "text-3xl font-bold tracking-tight"
              }
              style={variant !== "modern" ? { color: primary } : undefined}
            >
              {stat.value}
            </p>
            <p
              className={
                variant === "modern"
                  ? "mt-1 text-sm text-stone-400"
                  : "mt-1 text-sm text-stone-600"
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
              ? "font-editorial text-xs font-medium uppercase tracking-[0.2em] text-stone-500"
              : "text-3xl font-bold tracking-tight"
        }
        style={variant === "classic" ? { color: primary } : undefined}
      >
        {variant === "minimal" ? "Programs" : "Our Programs"}
      </h2>
      <div
        className={
          variant === "minimal"
            ? "mt-10 space-y-14"
            : "mt-8 grid gap-8 md:grid-cols-3"
        }
      >
        {programs.map((program) => (
          <article
            key={program.title}
            className={
              variant === "classic"
                ? "overflow-hidden border bg-white"
                : variant === "minimal"
                  ? "grid gap-6 md:grid-cols-[160px_1fr] md:items-start"
                  : "group overflow-hidden"
            }
            style={variant === "classic" ? { borderColor: `${primary}30` } : undefined}
          >
            <img
              src={program.image_url}
              alt={program.title}
              className={
                variant === "minimal"
                  ? "aspect-[4/3] w-full object-cover"
                  : variant === "classic"
                    ? "h-44 w-full object-cover"
                    : "h-48 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              }
            />
            <div className={variant === "minimal" ? "pt-1" : "pt-4"}>
              <h3
                className={
                  variant === "classic"
                    ? "font-serif text-lg font-semibold"
                    : variant === "minimal"
                      ? "font-editorial text-xl font-semibold tracking-tight"
                      : "text-lg font-semibold"
                }
                style={variant === "classic" ? { color: primary } : undefined}
              >
                {program.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
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
            ? "font-serif text-center text-3xl font-bold"
            : variant === "minimal"
              ? "font-editorial text-xs font-medium uppercase tracking-[0.2em] text-stone-500"
              : "text-3xl font-bold tracking-tight"
        }
      >
        {variant === "minimal" ? "Campus life" : "Life at our school"}
      </h2>
      <div
        className={
          variant === "minimal"
            ? "mt-8 grid grid-cols-2 gap-3"
            : "mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        }
      >
        {gallery.map((item, i) => (
          <figure key={`${item.url}-${i}`} className="group overflow-hidden">
            <img
              src={item.url}
              alt={item.caption ?? "Campus"}
              className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
  const secondary = school.theme_secondary_color ?? "#0f766e";
  const site = resolveSchoolWebsite(school);

  return (
    <div>
      <section className="relative min-h-[78vh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(115deg, ${primary}e6 0%, ${secondary}b3 48%, rgba(15,23,42,0.55) 100%)`,
          }}
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-28 text-white md:pb-20">
          <p className="school-animate-fade-up text-2xl font-extrabold tracking-tight md:text-4xl">
            {school.name}
          </p>
          <h1 className="school-animate-fade-up-delay mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            {site.heroTitle}
          </h1>
          <p className="school-animate-fade-up-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">
            {site.heroSubtitle ||
              "Every week without a clear admissions path costs families time and the school open seats."}
          </p>
          <div className="school-animate-fade-up-delay-2 mt-8 flex flex-wrap gap-4">
            <AdmissionsCta
              slug={school.slug}
              isPreview={isPreview}
              label="See what delayed enrollment costs"
              className="inline-flex items-center rounded-xl bg-white px-7 py-3.5 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
              style={{ color: primary }}
            />
            <a
              href="#programs"
              className="inline-flex items-center rounded-xl border border-white/50 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Explore programs
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-14 md:py-20">
        <StatsStrip stats={site.stats} primary={primary} variant="modern" />

        <ProgramsSection programs={site.programs} primary={primary} variant="modern" />

        <section id="about" className="scroll-mt-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">About us</h2>
              <p className="mt-4 leading-relaxed text-stone-600">{site.about}</p>
            </div>
            {site.gallery[0] && (
              <img
                src={site.gallery[0].url}
                alt="About"
                className="aspect-[4/3] w-full object-cover"
              />
            )}
          </div>
        </section>

        <GallerySection gallery={site.gallery} variant="modern" />

        {!isPreview && events.length > 0 && (
          <PublicEventsSection
            events={events}
            slug={school.slug}
            primary={primary}
            variant="modern"
          />
        )}

        <section id="contact" className="scroll-mt-24 bg-white px-6 py-10 md:px-10 md:py-14">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Get in touch</h2>
              <p className="mt-2 text-stone-600">
                Waiting for a campus visit can stall enrollment. Reach the office today.
              </p>
              <div className="mt-6">
                <ContactBlock school={school} />
              </div>
            </div>
            <div
              className="flex flex-col justify-center p-8 text-white"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              <h3 className="text-xl font-semibold">Stop losing open seats</h3>
              <p className="mt-2 text-white/90">
                Start the application online before another family claims the place you want.
              </p>
              <AdmissionsCta
                slug={school.slug}
                isPreview={isPreview}
                label="Apply before seats fill"
                className="mt-6 inline-flex w-fit items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold"
                style={{ color: primary }}
              />
            </div>
          </div>
        </section>
      </div>
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
    <div>
      <section className="relative min-h-[70vh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center text-white">
          {school.logo_url && (
            <img
              src={school.logo_url}
              alt=""
              className="school-animate-fade-up mb-6 h-20 w-20 border-2 border-white/80 object-cover"
            />
          )}
          <p className="school-animate-fade-up font-serif text-2xl font-bold tracking-[0.08em] md:text-4xl">
            {school.name}
          </p>
          <h1 className="school-animate-fade-up-delay mt-5 font-serif text-4xl font-bold tracking-wide md:text-5xl">
            {site.heroTitle}
          </h1>
          <p className="school-animate-fade-up-delay-2 mt-4 max-w-2xl font-serif text-lg italic text-white/90">
            {site.heroSubtitle ||
              "Tradition only holds if families can still find a place this year."}
          </p>
          <AdmissionsCta
            slug={school.slug}
            isPreview={isPreview}
            label="Apply before seats fill"
            className="school-animate-fade-up-delay-2 mt-8 inline-block px-10 py-3.5 font-serif font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}
          />
        </div>
      </section>

      <StatsStrip stats={site.stats} primary={primary} variant="classic" />

      <div className="mx-auto max-w-5xl space-y-0 px-6 py-4">
        <div className="bg-white/80 px-6 py-12 md:px-10">
          <ProgramsSection programs={site.programs} primary={primary} variant="classic" />
        </div>

        <section
          id="about"
          className="scroll-mt-24 border-t bg-white/80 px-6 py-12 md:px-10"
          style={{ borderColor: `${primary}22` }}
        >
          <h2 className="font-serif text-3xl font-bold" style={{ color: primary }}>
            About our school
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-stone-700">{site.about}</p>
        </section>

        <div
          className="border-t bg-white/80 px-6 py-12 md:px-10"
          style={{ borderColor: `${primary}22` }}
        >
          <GallerySection gallery={site.gallery} variant="classic" />
        </div>

        {!isPreview && events.length > 0 && (
          <div
            className="border-t bg-white/80 px-6 py-12 md:px-10"
            style={{ borderColor: `${primary}22` }}
          >
            <PublicEventsSection
              events={events}
              slug={school.slug}
              primary={primary}
              variant="classic"
            />
          </div>
        )}

        <section
          id="contact"
          className="scroll-mt-24 mb-16 grid border bg-white md:grid-cols-2"
          style={{ borderColor: `${primary}30` }}
        >
          <div
            className="border-b p-8 md:border-b-0 md:border-r"
            style={{ borderColor: `${primary}22` }}
          >
            <h2 className="font-serif text-2xl font-semibold">Contact</h2>
            <div className="mt-4 text-stone-700">
              <ContactBlock school={school} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="font-serif text-2xl font-semibold" style={{ color: primary }}>
              Admissions
            </h2>
            <p className="mt-3 max-w-sm text-stone-600">
              Delay the application and another family may take the seat you meant to claim.
            </p>
            <AdmissionsCta
              slug={school.slug}
              isPreview={isPreview}
              label="Apply before seats fill"
              className="mt-6 inline-block px-10 py-3.5 font-serif font-medium text-white"
              style={{ backgroundColor: primary }}
            />
          </div>
        </section>
      </div>
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
  const primary = school.theme_primary_color ?? "#1f2937";
  const site = resolveSchoolWebsite(school);

  return (
    <div className="font-editorial">
      <section className="relative min-h-[72vh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-[#0f172a]/35 to-transparent" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-3xl flex-col justify-end px-6 pb-14 pt-28 text-white">
          <p className="school-animate-fade-up text-xl font-semibold tracking-tight md:text-3xl">
            {school.name}
          </p>
          <h1 className="school-animate-fade-up-delay mt-4 text-4xl font-light tracking-tight md:text-5xl">
            {site.heroTitle}
          </h1>
          <p className="school-animate-fade-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
            {site.heroSubtitle ||
              "Quiet campuses still lose families when enrollment stays unclear."}
          </p>
          <AdmissionsCta
            slug={school.slug}
            isPreview={isPreview}
            label="Secure a place this term"
            className="school-animate-fade-up-delay-2 mt-8 inline-block border border-white/70 px-8 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-white/10"
          />
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-16 px-6 py-16">
        <StatsStrip stats={site.stats} primary={primary} variant="minimal" />

        <ProgramsSection programs={site.programs} primary={primary} variant="minimal" />

        <section id="about" className="scroll-mt-24 border-t border-stone-300/70 pt-12">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">About</h2>
          <p className="mt-6 leading-relaxed text-stone-600">{site.about}</p>
        </section>

        <GallerySection gallery={site.gallery} variant="minimal" />

        {!isPreview && events.length > 0 && (
          <PublicEventsSection
            events={events}
            slug={school.slug}
            primary={primary}
            variant="minimal"
          />
        )}

        <section id="contact" className="scroll-mt-24 border-t border-stone-300/70 pt-12">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Contact</h2>
          <div className="mt-6 text-stone-600">
            <ContactBlock school={school} />
          </div>
          <AdmissionsCta
            slug={school.slug}
            isPreview={isPreview}
            label="Apply before seats fill"
            className="mt-8 inline-block border-2 px-8 py-3 text-sm font-medium tracking-wide"
            style={{ borderColor: primary, color: primary }}
          />
        </section>
      </div>
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
