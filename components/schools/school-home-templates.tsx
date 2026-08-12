import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { SchoolRow } from "@/lib/db/schools";
import type { PublicSchoolEvent } from "@/lib/db/public-events";
import { resolveSchoolWebsite } from "@/lib/schools/website-content";
import { ProgramPhotoGrid } from "./program-photo-grid";
import { PublicEventsSection } from "./public-events-section";

function AdmissionsCta({
  slug,
  label,
  className = "",
  style,
  isPreview = false,
}: {
  slug: string;
  label: string;
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

function ContactBlock({
  school,
  t,
}: {
  school: SchoolRow;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-3 text-sm">
      {school.contact_email && (
        <p>
          <span className="font-medium">{t("chrome.email")}:</span>{" "}
          <a href={`mailto:${school.contact_email}`} className="hover:underline">
            {school.contact_email}
          </a>
        </p>
      )}
      {school.contact_phone && (
        <p>
          <span className="font-medium">{t("chrome.phone")}:</span> {school.contact_phone}
        </p>
      )}
      {school.address && <p>{school.address}</p>}
      {!school.contact_email && !school.contact_phone && !school.address && (
        <p className="text-stone-500">{t("chrome.contactComingSoon")}</p>
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
          ? "bg-white py-14"
          : variant === "minimal"
            ? "py-12"
            : "bg-stone-950 px-6 py-14 text-white"
      }
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
              className="text-3xl font-bold tracking-tight"
              style={variant !== "modern" ? { color: primary } : undefined}
            >
              {stat.value}
            </p>
            <p
              className={
                variant === "modern"
                  ? "mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400"
                  : "mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500"
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

function GallerySection({
  gallery,
  primary,
  variant = "modern",
  t,
}: {
  gallery: { url: string; caption?: string }[];
  primary?: string;
  variant?: "modern" | "classic" | "minimal";
  t: (key: string) => string;
}) {
  if (gallery.length === 0) return null;

  return (
    <section className="scroll-mt-24" id="gallery">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2
          className={
            variant === "classic"
              ? "text-3xl font-bold tracking-tight"
              : variant === "minimal"
                ? "text-xs font-semibold uppercase tracking-[0.2em] text-stone-500"
                : "text-3xl font-bold tracking-tight"
          }
          style={variant === "classic" && primary ? { color: primary } : undefined}
        >
          {variant === "minimal" ? t("chrome.campusLife") : t("chrome.ourCommunity")}
        </h2>
        {variant === "classic" && (
          <a
            href="#contact"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 hover:text-stone-800"
          >
            {t("chrome.viewCampusStoriesArrow")}
          </a>
        )}
      </div>
      <div
        className={
          variant === "minimal"
            ? "grid grid-cols-2 gap-3"
            : "grid grid-cols-2 gap-3 md:grid-cols-4"
        }
      >
        {gallery.map((item, i) => (
          <figure key={`${item.url}-${i}`} className="group overflow-hidden">
            <img
              src={item.url}
              alt={item.caption ?? "Campus"}
              className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
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
  t,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
  t: (key: string) => string;
}) {
  const primary = school.theme_primary_color ?? "#0d9488";
  const secondary = school.theme_secondary_color ?? "#0f766e";
  const site = resolveSchoolWebsite(school);

  return (
    <div>
      <section className="relative min-h-[88vh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-32 text-white">
          <p className="school-animate-fade-up text-sm font-semibold uppercase tracking-[0.22em] text-white/85">
            {school.name}
          </p>
          <h1 className="school-animate-fade-up-delay mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            {site.heroTitle}
          </h1>
          <p className="school-animate-fade-up-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-white/90">
            {site.heroSubtitle || t("chrome.heroFallbackModern")}
          </p>
          <div className="school-animate-fade-up-delay-2 mt-8 flex flex-wrap gap-4">
            <AdmissionsCta
              slug={school.slug}
              isPreview={isPreview}
              label={t("chrome.applyBeforeSeatsFill")}
              className="inline-flex border border-white bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-transparent hover:text-white"
              style={{ color: primary }}
            />
            <a
              href="#programs"
              className="inline-flex border border-white/80 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-stone-900"
            >
              {t("chrome.explorePrograms")}
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center text-white" style={{ backgroundColor: primary }}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
          {t("chrome.rootedInCommunity")}
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-2xl font-bold tracking-tight md:text-4xl">
          {t("chrome.legacyJoinThisTerm")}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90">
            {site.about || t("chrome.aboutFallback", { schoolName: school.name })}
        </p>
        <a
          href="#about"
          className="mt-8 inline-flex border border-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-stone-900"
        >
          {t("chrome.aboutTheSchool")}
        </a>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-6 py-16 md:py-20">
        <section id="programs" className="scroll-mt-24">
          <h2 className="text-3xl font-bold tracking-tight">{t("chrome.discoverSchool", { schoolName: school.name })}</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            {t("chrome.programsFillByDivision")}
          </p>
          <div className="mt-8">
            <ProgramPhotoGrid programs={site.programs} accent={secondary} />
          </div>
        </section>

        <StatsStrip stats={site.stats} primary={primary} variant="modern" />

        <section id="about" className="scroll-mt-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t("chrome.aboutUs")}</h2>
              <p className="mt-4 leading-relaxed text-stone-600">{site.about}</p>
            </div>
            {site.gallery[0] && (
              <img
                src={site.gallery[0].url}
                alt={t("chrome.aboutUs")}
                className="aspect-[4/3] w-full object-cover"
              />
            )}
          </div>
        </section>

        <GallerySection gallery={site.gallery} variant="modern" t={t} />

        {!isPreview && events.length > 0 && (
          <PublicEventsSection
            events={events}
            slug={school.slug}
            primary={primary}
            variant="modern"
          />
        )}

        <section id="contact" className="scroll-mt-24 bg-stone-950 px-6 py-12 text-white md:px-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t("chrome.getInTouch")}</h2>
              <p className="mt-2 text-white/75">
                {t("chrome.waitingForVisit")}
              </p>
              <div className="mt-6 text-white/90">
                <ContactBlock school={school} t={t} />
              </div>
            </div>
            <div className="flex flex-col justify-center border border-white/20 p-8">
              <h3 className="text-xl font-semibold">{t("chrome.stopLosingOpenSeats")}</h3>
              <p className="mt-2 text-white/80">
                {t("chrome.startApplicationOnline")}
              </p>
              <AdmissionsCta
                slug={school.slug}
                isPreview={isPreview}
                label={t("chrome.applyBeforeSeatsFill")}
                className="mt-6 inline-flex w-fit border border-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-stone-900"
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
  t,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
  t: (key: string) => string;
}) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);

  return (
    <div>
      {/* Media-first hero — TASOK-inspired */}
      <section className="relative min-h-[92vh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-6 pb-14 pt-40">
          <div className="school-animate-fade-up max-w-2xl text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
              {t("chrome.possibilitiesAndPartnerships")}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              {site.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
              {site.heroSubtitle || t("chrome.heroFallbackClassic")}
            </p>
            <AdmissionsCta
              slug={school.slug}
              isPreview={isPreview}
              label={t("chrome.applyNow")}
              className="mt-7 inline-flex border border-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-stone-900"
            />
          </div>
        </div>
      </section>

      {/* Navy mission block */}
      <section
        id="about"
        className="scroll-mt-24 px-6 py-20 text-center text-white"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto mb-6 h-[2px] w-16" style={{ backgroundColor: accent }} />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
          {t("chrome.legacyLeadership")}
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-2xl font-bold tracking-tight md:text-4xl">
          {t("chrome.trustedSchooling")}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90">
            {site.about || t("chrome.classicAboutFallback", { schoolName: school.name })}
        </p>
        <AdmissionsCta
          slug={school.slug}
          isPreview={isPreview}
          label={t("chrome.aboutAdmissions")}
          className="mt-8 inline-flex border border-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-stone-900"
        />
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-6 py-16 md:py-20">
        <section id="programs" className="scroll-mt-24">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: primary }}>
            {t("chrome.discoverOurPrograms")}
          </h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            {t("chrome.hoverEachPath")}
          </p>
          <div className="mt-8">
            <ProgramPhotoGrid programs={site.programs} accent={accent} />
          </div>
        </section>

        <StatsStrip stats={site.stats} primary={primary} variant="classic" />

        <GallerySection gallery={site.gallery} primary={primary} variant="classic" t={t} />

        {!isPreview && events.length > 0 && (
          <PublicEventsSection
            events={events}
            slug={school.slug}
            primary={primary}
            variant="classic"
          />
        )}
      </div>

      <section
        id="contact"
        className="scroll-mt-24 grid md:grid-cols-2"
        style={{ backgroundColor: primary }}
      >
        <div className="border-b border-white/15 px-8 py-14 text-white md:border-b-0 md:border-r">
          <div className="mb-5 h-[2px] w-12" style={{ backgroundColor: accent }} />
          <h2 className="text-2xl font-bold">{t("nav.contact")}</h2>
          <div className="mt-4 text-white/85">
            <ContactBlock school={school} t={t} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-bold">{t("nav.admissions")}</h2>
          <p className="mt-3 max-w-sm text-white/85">
            {t("chrome.delayTheApplication")}
          </p>
          <AdmissionsCta
            slug={school.slug}
            isPreview={isPreview}
            label={t("chrome.applyBeforeSeatsFill")}
            className="mt-6 inline-flex border border-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-stone-900"
          />
        </div>
      </section>
    </div>
  );
}

function MinimalTemplate({
  school,
  events = [],
  isPreview = false,
  t,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
  t: (key: string) => string;
}) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);

  return (
    <div className="font-editorial">
      <section className="relative min-h-[85vh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1224]/85 via-[#0b1224]/30 to-black/25" />
        <div className="relative mx-auto flex min-h-[85vh] max-w-3xl flex-col justify-end px-6 pb-14 pt-28 text-white">
          <div className="school-animate-fade-up mb-5 h-px w-12" style={{ backgroundColor: accent }} />
          <p className="school-animate-fade-up text-sm font-medium tracking-wide text-white/85">
            {school.name}
          </p>
          <h1 className="school-animate-fade-up-delay mt-4 text-4xl font-light tracking-tight md:text-5xl">
            {site.heroTitle}
          </h1>
          <p className="school-animate-fade-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/90">
            {site.heroSubtitle || t("chrome.heroFallbackMinimal")}
          </p>
          <AdmissionsCta
            slug={school.slug}
            isPreview={isPreview}
            label={t("chrome.secureAPlaceThisTerm")}
            className="school-animate-fade-up-delay-2 mt-8 inline-block border border-white/80 px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-stone-900"
          />
        </div>
      </section>

      <section className="px-6 py-16 text-center" style={{ backgroundColor: primary }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          {t("chrome.excellenceIntegrityInclusivity")}
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90">
          {site.about || t("chrome.seatsNotUnlimited", { schoolName: school.name })}
        </p>
      </section>

      <div className="mx-auto max-w-3xl space-y-16 px-6 py-16">
        <section id="programs" className="scroll-mt-24">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            {t("chrome.programs")}
          </h2>
          <div className="mt-8">
            <ProgramPhotoGrid programs={site.programs} accent={accent} />
          </div>
        </section>

        <StatsStrip stats={site.stats} primary={primary} variant="minimal" />

        <section id="about" className="scroll-mt-24 border-t border-stone-200 pt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{t("chrome.about")}</h2>
          <p className="mt-6 leading-relaxed text-stone-600">{site.about}</p>
        </section>

        <GallerySection gallery={site.gallery} variant="minimal" t={t} />

        {!isPreview && events.length > 0 && (
          <PublicEventsSection
            events={events}
            slug={school.slug}
            primary={primary}
            variant="minimal"
          />
        )}

        <section id="contact" className="scroll-mt-24 border-t border-stone-200 pt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{t("nav.contact")}</h2>
          <div className="mt-6 text-stone-600">
            <ContactBlock school={school} t={t} />
          </div>
          <AdmissionsCta
            slug={school.slug}
            isPreview={isPreview}
            label={t("chrome.applyBeforeSeatsFill")}
            className="mt-8 inline-block border px-8 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ borderColor: primary, color: primary }}
          />
        </section>
      </div>
    </div>
  );
}

export async function SchoolHomeTemplate({
  school,
  events = [],
  isPreview = false,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
}) {
  const t = await getTranslations("schools");
  const template = school.website_template ?? "modern";

  switch (template) {
    case "classic":
      return <ClassicTemplate school={school} events={events} isPreview={isPreview} t={t} />;
    case "minimal":
      return <MinimalTemplate school={school} events={events} isPreview={isPreview} t={t} />;
    default:
      return <ModernTemplate school={school} events={events} isPreview={isPreview} t={t} />;
  }
}
