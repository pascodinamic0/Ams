import { getTranslations } from "next-intl/server";
import type { SchoolRow } from "@/lib/db/schools";
import { resolveSchoolWebsite } from "@/lib/schools/website-content";
import type { WebsiteTemplateId } from "@/lib/schools/website-templates";
import { SchoolSiteHeader } from "@/components/schools/school-site-header";

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

function SchoolFooter({
  school,
  site,
  className = "",
  light = false,
}: {
  school: SchoolRow;
  site: ReturnType<typeof resolveSchoolWebsite>;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={className}>
      <p className={`text-sm ${light ? "text-white/70" : "text-stone-500"}`}>
        &copy; {new Date().getFullYear()} {school.name}
      </p>
      {site.footerTagline && (
        <p className={`mt-1 text-sm ${light ? "text-white/55" : "text-stone-400"}`}>
          {site.footerTagline}
        </p>
      )}
      <SocialLinks social={site.social} className="mt-3" light={light} />
    </div>
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
}: ShellProps) {
  const primary = school.theme_primary_color ?? "#0d9488";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen bg-white text-stone-900">
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
      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <SchoolFooter school={school} site={site} />
        </div>
      </footer>
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
}: ShellProps) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen bg-white text-stone-900">
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
      <footer className="py-10 text-white" style={{ backgroundColor: primary }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 h-[2px] w-16" style={{ backgroundColor: accent }} />
          <SchoolFooter school={school} site={site} light />
        </div>
      </footer>
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
}: ShellProps) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="font-editorial min-h-screen bg-white text-stone-900">
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
      <footer className="border-t border-stone-200 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 h-px w-12" style={{ backgroundColor: primary }} />
          <SchoolFooter school={school} site={site} />
        </div>
      </footer>
    </div>
  );
}

export async function SchoolSiteLayout({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const t = await getTranslations("schools");
  const tc = await getTranslations("common");
  const template = (school.website_template ?? "modern") as WebsiteTemplateId;
  const chrome = {
    t,
    menuLabel: tc("menu"),
    openMenuLabel: tc("openMenu"),
    closeMenuLabel: tc("closeMenu"),
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
