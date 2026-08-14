import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { SchoolRow } from "@/lib/db/schools";
import type { PublicSchoolEvent } from "@/lib/db/public-events";
import { resolveSchoolWebsite } from "@/lib/schools/website-content";
import { cn } from "@/lib/utils";
import { ProgramPhotoGrid } from "./program-photo-grid";
import { PublicEventsSection } from "./public-events-section";

type SchoolSiteTranslator = (key: string, values?: Record<string, string>) => string;

function tWithSchoolName(t: SchoolSiteTranslator, key: string, schoolName: string) {
  return t(key, { schoolName });
}

const heroCtaSolid =
  "inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-full bg-white px-5 py-2.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] transition-colors hover:bg-white/90 sm:h-12 sm:w-auto sm:px-7 sm:text-xs sm:tracking-[0.12em]";

const heroCtaOutline =
  "inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-full border border-white/85 px-5 py-2.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-stone-900 sm:h-12 sm:w-auto sm:px-7 sm:text-xs sm:tracking-[0.12em]";

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

  const columns =
    stats.length >= 4
      ? "grid-cols-2 lg:grid-cols-4"
      : stats.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2";

  return (
    <section
      className={
        variant === "classic"
          ? "border-y border-stone-200 bg-stone-50 py-10 sm:py-12"
          : variant === "minimal"
            ? "border-y border-stone-200 py-10 sm:py-12"
            : "bg-stone-950 py-10 text-white sm:py-12"
      }
    >
      <div
        className={cn(
          "mx-auto grid max-w-5xl px-4 sm:px-6",
          columns
        )}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-h-[6.5rem] flex-col items-center justify-center px-3 py-5 text-center sm:min-h-[7.5rem] sm:px-6"
          >
            <p
              className="font-sans text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl"
              style={variant !== "modern" ? { color: primary } : undefined}
            >
              {stat.value}
            </p>
            <p
              className={cn(
                "mt-2 max-w-[11rem] font-sans text-[11px] font-medium uppercase leading-snug tracking-[0.16em]",
                variant === "modern" ? "text-white/55" : "text-stone-500"
              )}
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
  t: SchoolSiteTranslator;
}) {
  if (gallery.length === 0) return null;

  return (
    <section className="scroll-mt-28" id="gallery">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <h2
          className={
            variant === "classic"
              ? "text-2xl font-bold tracking-tight sm:text-3xl"
              : variant === "minimal"
                ? "text-xs font-semibold uppercase tracking-[0.2em] text-stone-500"
                : "text-2xl font-bold tracking-tight sm:text-3xl"
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
            ? "grid grid-cols-2 gap-2 sm:gap-3"
            : "grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4"
        }
      >
        {gallery.map((item, i) => (
          <figure key={`${item.url}-${i}`} className="group overflow-hidden">
            <img
              src={item.url}
              alt={item.caption ?? t("chrome.campusPhoto")}
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
  locale,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
  t: SchoolSiteTranslator;
  locale: string;
}) {
  const primary = school.theme_primary_color ?? "#0d9488";
  const secondary = school.theme_secondary_color ?? "#0f766e";
  const site = resolveSchoolWebsite(school);
  const showEyebrow = site.heroTitle.trim().toLowerCase() !== school.name.trim().toLowerCase();

  return (
    <div>
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/25" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 text-white sm:px-6 sm:pb-14 sm:pt-32 md:pb-16">
          {showEyebrow ? (
            <p className="school-animate-fade-up text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-sm sm:tracking-[0.22em]">
              {school.name}
            </p>
          ) : null}
          <h1 className="school-animate-fade-up-delay mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:mt-4 sm:text-5xl md:text-6xl">
            {site.heroTitle}
          </h1>
          <p className="school-animate-fade-up-delay-2 mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:mt-5 sm:text-lg">
            {site.heroSubtitle || t("chrome.heroFallbackModern")}
          </p>
          <div className="school-animate-fade-up-delay-2 mt-7 flex w-full max-w-sm flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center">
            <AdmissionsCta
              slug={school.slug}
              isPreview={isPreview}
              label={t("chrome.applyBeforeSeatsFill")}
              className={heroCtaSolid}
              style={{ color: primary }}
            />
            <a href="#programs" className={heroCtaOutline}>
              {t("chrome.explorePrograms")}
            </a>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-28 px-4 py-10 text-white sm:px-6 sm:py-12"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-xs">
              {t("chrome.aboutUs")}
            </p>
            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl md:text-4xl">
              {school.name}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
              {site.about || tWithSchoolName(t, "chrome.aboutFallback", school.name)}
            </p>
          </div>
          {site.gallery[0] ? (
            <img
              src={site.gallery[0].url}
              alt={t("chrome.aboutUs")}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : null}
        </div>
      </section>

      {site.programs.length > 0 ? (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <section id="programs" className="scroll-mt-28">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {tWithSchoolName(t, "chrome.discoverSchool", school.name)}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              {t("chrome.programsFillByDivision")}
            </p>
            <div className="mt-8">
              <ProgramPhotoGrid programs={site.programs} accent={secondary} />
            </div>
          </section>
        </div>
      ) : null}

      <StatsStrip stats={site.stats} primary={primary} variant="modern" />

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:space-y-16 sm:px-6 sm:py-16">
        <GallerySection gallery={site.gallery} variant="modern" t={t} />

        {!isPreview && events.length > 0 && (
          <PublicEventsSection
            events={events}
            slug={school.slug}
            primary={primary}
            variant="modern"
            t={t}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}

function ClassicTemplate({
  school,
  events = [],
  isPreview = false,
  t,
  locale,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
  t: SchoolSiteTranslator;
  locale: string;
}) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);

  return (
    <div>
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-40">
          <div className="school-animate-fade-up max-w-2xl text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-xs sm:tracking-[0.22em]">
              {t("chrome.aboutUs")}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {site.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {site.heroSubtitle || t("chrome.heroFallbackClassic")}
            </p>
            <AdmissionsCta
              slug={school.slug}
              isPreview={isPreview}
              label={t("chrome.applyNow")}
              className={`${heroCtaOutline} mt-7 max-w-sm sm:mt-8`}
            />
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-28 px-4 py-12 text-center text-white sm:px-6 sm:py-16"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto mb-5 h-[2px] w-16" style={{ backgroundColor: accent }} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-xs sm:tracking-[0.24em]">
          {t("chrome.aboutUs")}
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-xl font-bold tracking-tight sm:mt-4 sm:text-2xl md:text-4xl">
          {t("chrome.trustedSchooling")}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-base">
          {site.about || tWithSchoolName(t, "chrome.classicAboutFallback", school.name)}
        </p>
        <AdmissionsCta
          slug={school.slug}
          isPreview={isPreview}
          label={t("chrome.aboutAdmissions")}
          className={`${heroCtaOutline} mt-7 sm:mt-8`}
        />
      </section>

      {site.programs.length > 0 ? (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <section id="programs" className="scroll-mt-28">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: primary }}>
              {t("chrome.discoverOurPrograms")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              {t("chrome.hoverEachPath")}
            </p>
            <div className="mt-8">
              <ProgramPhotoGrid programs={site.programs} accent={accent} />
            </div>
          </section>
        </div>
      ) : (
        <div id="programs" className="scroll-mt-28" />
      )}

      <StatsStrip stats={site.stats} primary={primary} variant="classic" />

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:space-y-16 sm:px-6 sm:py-16">
        <GallerySection gallery={site.gallery} primary={primary} variant="classic" t={t} />

        {!isPreview && events.length > 0 && (
          <PublicEventsSection
            events={events}
            slug={school.slug}
            primary={primary}
            variant="classic"
            t={t}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}

function MinimalTemplate({
  school,
  events = [],
  isPreview = false,
  t,
  locale,
}: {
  school: SchoolRow;
  events?: PublicSchoolEvent[];
  isPreview?: boolean;
  t: SchoolSiteTranslator;
  locale: string;
}) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);
  const showEyebrow = site.heroTitle.trim().toLowerCase() !== school.name.trim().toLowerCase();

  return (
    <div className="font-editorial">
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <img
          src={site.heroImage}
          alt=""
          className="school-animate-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1224]/85 via-[#0b1224]/30 to-black/25" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-3xl flex-col justify-end px-4 pb-10 pt-24 text-white sm:px-6 sm:pb-14 sm:pt-28">
          <div className="school-animate-fade-up mb-4 h-px w-12 sm:mb-5" style={{ backgroundColor: accent }} />
          {showEyebrow ? (
            <p className="school-animate-fade-up text-sm font-medium tracking-wide text-white/85">
              {school.name}
            </p>
          ) : null}
          <h1 className="school-animate-fade-up-delay mt-3 text-3xl font-light tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
            {site.heroTitle}
          </h1>
          <p className="school-animate-fade-up-delay-2 mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:mt-5">
            {site.heroSubtitle || t("chrome.heroFallbackMinimal")}
          </p>
          <AdmissionsCta
            slug={school.slug}
            isPreview={isPreview}
            label={t("chrome.secureAPlaceThisTerm")}
            className={`${heroCtaOutline} school-animate-fade-up-delay-2 mt-7 max-w-sm sm:mt-8`}
          />
        </div>
      </section>

      <section id="about" className="scroll-mt-28 px-4 py-10 text-center sm:px-6 sm:py-12" style={{ backgroundColor: primary }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-xs sm:tracking-[0.2em]">
          {t("chrome.aboutUs")}
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          {site.about || tWithSchoolName(t, "chrome.seatsNotUnlimited", school.name)}
        </p>
      </section>

      {site.programs.length > 0 ? (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <section id="programs" className="scroll-mt-28">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {t("chrome.programs")}
            </h2>
            <div className="mt-8">
              <ProgramPhotoGrid programs={site.programs} accent={accent} />
            </div>
          </section>
        </div>
      ) : (
        <div id="programs" className="scroll-mt-28" />
      )}

      <StatsStrip stats={site.stats} primary={primary} variant="minimal" />

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:space-y-16 sm:px-6 sm:py-16">
        <GallerySection gallery={site.gallery} variant="minimal" t={t} />

        {!isPreview && events.length > 0 && (
          <PublicEventsSection
            events={events}
            slug={school.slug}
            primary={primary}
            variant="minimal"
            t={t}
            locale={locale}
          />
        )}
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
  const t = (await getTranslations("schools")) as SchoolSiteTranslator;
  const locale = await getLocale();
  const template = school.website_template ?? "modern";

  switch (template) {
    case "classic":
      return <ClassicTemplate school={school} events={events} isPreview={isPreview} t={t} locale={locale} />;
    case "minimal":
      return <MinimalTemplate school={school} events={events} isPreview={isPreview} t={t} locale={locale} />;
    default:
      return <ModernTemplate school={school} events={events} isPreview={isPreview} t={t} locale={locale} />;
  }
}
