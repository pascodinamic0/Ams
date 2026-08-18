import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { SchoolRow } from "@/lib/db/schools";
import { resolveSchoolWebsite } from "@/lib/schools/website-content";
import type { WebsiteTemplateId } from "@/lib/schools/website-templates";
import { SchoolSiteHeader } from "@/components/schools/school-site-header";
import { SchoolCampusMap } from "@/components/schools/school-campus-map";
import {
  googleMapsOpenUrl,
  resolveGoogleMapsEmbedSrc,
} from "@/lib/schools/google-maps";

type ChromeT = (key: string) => string;

type SchoolSiteLayoutProps = {
  school: SchoolRow;
  children: React.ReactNode;
  isPreview?: boolean;
};

type ShellProps = SchoolSiteLayoutProps & {
  t: ChromeT;
  menuLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  mapEmbedSrc: string | null;
  mapOpenUrl: string | null;
};

function SocialLinks({
  social,
  className = "",
  light = false,
}: {
  social: { facebook?: string; instagram?: string; twitter?: string };
  className?: string;
  light?: boolean;
}) {
  const links = [
    { href: social.facebook, label: "Facebook" },
    { href: social.instagram, label: "Instagram" },
    { href: social.twitter, label: "Twitter" },
  ].filter((l) => l.href);

  if (links.length === 0) return null;

  return (
    <div className={`flex gap-4 ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={
            light
              ? "text-sm text-white/70 hover:text-white"
              : "text-sm text-stone-500 hover:text-zinc-800"
          }
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

function CompactSiteFooter({
  school,
  site,
  t,
  applyHref,
  applyLabel,
  light = false,
  maxWidthClass = "max-w-6xl",
  mapEmbedSrc,
  mapOpenUrl,
}: {
  school: SchoolRow;
  site: ReturnType<typeof resolveSchoolWebsite>;
  t: ChromeT;
  applyHref: string;
  applyLabel: string;
  light?: boolean;
  maxWidthClass?: string;
  mapEmbedSrc: string | null;
  mapOpenUrl: string | null;
}) {
  const details = [school.contact_email, school.contact_phone, school.address].filter(Boolean);

  return (
    <footer
      id="contact"
      className={light ? "text-white" : "border-t border-stone-200 bg-stone-50 text-stone-700"}
    >
      <div className={`mx-auto ${maxWidthClass} px-4 py-4 sm:px-6 sm:py-5 pb-[max(1rem,env(safe-area-inset-bottom))]`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {details.length > 0 ? (
              <p className={`text-xs leading-relaxed sm:text-sm ${light ? "text-white/80" : "text-stone-600"}`}>
                {details.join(" · ")}
              </p>
            ) : (
              <p className={`text-xs sm:text-sm ${light ? "text-white/60" : "text-stone-500"}`}>
                {t("chrome.contactComingSoon")}
              </p>
            )}
            <p className={`mt-1 text-xs ${light ? "text-white/55" : "text-stone-400"}`}>
              &copy; {new Date().getFullYear()} {school.name}
              {site.footerTagline ? ` · ${site.footerTagline}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <SocialLinks social={site.social} light={light} className="gap-3" />
            <Link
              href={applyHref}
              className={
                light
                  ? "inline-flex h-9 items-center rounded-full bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-900"
                  : "inline-flex h-9 items-center rounded-full bg-stone-900 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
              }
            >
              {applyLabel}
            </Link>
          </div>
        </div>
        {mapEmbedSrc && (
          <div className="mt-4 overflow-hidden rounded-xl">
            <SchoolCampusMap
              embedSrc={mapEmbedSrc}
              openUrl={mapOpenUrl}
              title={t("chrome.campusMap")}
              openLabel={t("chrome.openInGoogleMaps")}
              light={light}
            />
          </div>
        )}
      </div>
    </footer>
  );
}

function ModernShell({
  school,
  children,
  isPreview,
  t,
  menuLabel,
  openMenuLabel,
  closeMenuLabel,
  mapEmbedSrc,
  mapOpenUrl,
}: ShellProps) {
  const primary = school.theme_primary_color ?? "#0d9488";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-stone-900">
      <SchoolSiteHeader
        schoolName={school.name}
        logoUrl={school.logo_url}
        homeHref={base}
        tagline={t("chrome.excellenceIntegrityCommunity")}
        accentColor={primary}
        links={[
          { href: `${base}#about`, label: t("nav.about") },
          { href: `${base}#programs`, label: t("nav.programs") },
          {
            href: isPreview ? "#events" : `/schools/${school.slug}/events`,
            label: t("nav.events"),
          },
          {
            href: isPreview ? "#" : `/schools/${school.slug}/visit`,
            label: t("nav.bookVisit"),
          },
          { href: `${base}#contact`, label: t("nav.contact") },
        ]}
        loginHref="/login"
        loginLabel={t("nav.login")}
        applyHref={isPreview ? "#" : `/schools/${school.slug}/enroll`}
        applyLabel={t("chrome.applyNow")}
        menuLabel={menuLabel}
        openMenuLabel={openMenuLabel}
        closeMenuLabel={closeMenuLabel}
      />
      <main>{children}</main>
      <CompactSiteFooter
        school={school}
        site={site}
        t={t}
        applyHref={isPreview ? "#" : `/schools/${school.slug}/enroll`}
        applyLabel={t("chrome.applyNow")}
        mapEmbedSrc={mapEmbedSrc}
        mapOpenUrl={mapOpenUrl}
      />
    </div>
  );
}

function ClassicShell({
  school,
  children,
  isPreview,
  t,
  menuLabel,
  openMenuLabel,
  closeMenuLabel,
  mapEmbedSrc,
  mapOpenUrl,
}: ShellProps) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-stone-900">
      <SchoolSiteHeader
        schoolName={school.name}
        logoUrl={school.logo_url}
        homeHref={base}
        tagline={t("chrome.excellenceIntegrityInclusivity")}
        accentColor={accent}
        links={[
          { href: `${base}#about`, label: t("nav.about") },
          { href: `${base}#programs`, label: t("chrome.academics") },
          { href: `${base}#gallery`, label: t("chrome.campusLife") },
          {
            href: isPreview ? "#events" : `/schools/${school.slug}/events`,
            label: t("chrome.calendar"),
          },
          { href: `${base}#contact`, label: t("chrome.community") },
        ]}
        loginHref="/login"
        loginLabel={t("nav.login")}
        applyHref={isPreview ? "#" : `/schools/${school.slug}/enroll`}
        applyLabel={t("chrome.applyNow")}
        menuLabel={menuLabel}
        openMenuLabel={openMenuLabel}
        closeMenuLabel={closeMenuLabel}
      />
      <main>{children}</main>
      <div style={{ backgroundColor: primary }}>
        <CompactSiteFooter
          school={school}
          site={site}
          t={t}
          applyHref={isPreview ? "#" : `/schools/${school.slug}/enroll`}
          applyLabel={t("chrome.applyNow")}
          light
          mapEmbedSrc={mapEmbedSrc}
          mapOpenUrl={mapOpenUrl}
        />
      </div>
    </div>
  );
}

function MinimalShell({
  school,
  children,
  isPreview,
  t,
  menuLabel,
  openMenuLabel,
  closeMenuLabel,
  mapEmbedSrc,
  mapOpenUrl,
}: ShellProps) {
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="font-editorial min-h-screen overflow-x-hidden bg-white text-stone-900">
      <SchoolSiteHeader
        schoolName={school.name}
        logoUrl={school.logo_url}
        homeHref={base}
        accentColor={accent}
        contentWidthClass="max-w-3xl"
        links={[
          { href: `${base}#programs`, label: t("nav.programs") },
          { href: `${base}#about`, label: t("nav.about") },
          {
            href: isPreview ? "#events" : `/schools/${school.slug}/events`,
            label: t("nav.events"),
          },
          { href: `${base}#contact`, label: t("nav.contact") },
        ]}
        loginHref="/login"
        loginLabel={t("nav.login")}
        applyHref={isPreview ? "#" : `/schools/${school.slug}/enroll`}
        applyLabel={t("chrome.apply")}
        menuLabel={menuLabel}
        openMenuLabel={openMenuLabel}
        closeMenuLabel={closeMenuLabel}
      />
      <main>{children}</main>
      <CompactSiteFooter
        school={school}
        site={site}
        t={t}
        applyHref={isPreview ? "#" : `/schools/${school.slug}/enroll`}
        applyLabel={t("chrome.apply")}
        maxWidthClass="max-w-3xl"
        mapEmbedSrc={mapEmbedSrc}
        mapOpenUrl={mapOpenUrl}
      />
    </div>
  );
}

export async function SchoolSiteLayout({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const t = await getTranslations("schools");
  const tc = await getTranslations("common");
  const template = (school.website_template ?? "modern") as WebsiteTemplateId;
  const site = resolveSchoolWebsite(school);
  const mapEmbedSrc = await resolveGoogleMapsEmbedSrc(site.mapUrl, school.address);
  const mapOpenUrl = googleMapsOpenUrl(site.mapUrl, school.address);
  const chrome = {
    t,
    menuLabel: tc("menu"),
    openMenuLabel: tc("openMenu"),
    closeMenuLabel: tc("closeMenu"),
    mapEmbedSrc,
    mapOpenUrl,
  };

  switch (template) {
    case "classic":
      return (
        <ClassicShell school={school} isPreview={isPreview} {...chrome}>
          {children}
        </ClassicShell>
      );
    case "minimal":
      return (
        <MinimalShell school={school} isPreview={isPreview} {...chrome}>
          {children}
        </MinimalShell>
      );
    default:
      return (
        <ModernShell school={school} isPreview={isPreview} {...chrome}>
          {children}
        </ModernShell>
      );
  }
}
