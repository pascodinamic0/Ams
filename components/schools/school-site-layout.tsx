import Link from "next/link";
import type { SchoolRow } from "@/lib/db/schools";
import { resolveSchoolWebsite } from "@/lib/schools/website-content";
import type { WebsiteTemplateId } from "@/lib/schools/website-templates";

type SchoolSiteLayoutProps = {
  school: SchoolRow;
  children: React.ReactNode;
  isPreview?: boolean;
};

function NavLink({
  href,
  children,
  className = "",
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Link
      href={href}
      className={`text-sm transition-opacity hover:opacity-70 ${className}`}
      style={style}
    >
      {children}
    </Link>
  );
}

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

function ModernShell({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const primary = school.theme_primary_color ?? "#0d9488";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="h-[3px]" style={{ backgroundColor: primary }} />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href={base} className="text-white">
            <span className="block text-lg font-bold tracking-tight drop-shadow">
              {school.name}
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              Excellence · Integrity · Community
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.14em] text-white sm:flex">
            <NavLink href={`${base}#programs`} className="text-white">
              Programs
            </NavLink>
            <NavLink href={`${base}#about`} className="text-white">
              About
            </NavLink>
            <NavLink
              href={isPreview ? "#events" : `/schools/${school.slug}/events`}
              className="text-white"
            >
              Events
            </NavLink>
            <NavLink href={`${base}#contact`} className="text-white">
              Contact
            </NavLink>
            <NavLink href="/login" className="text-white">
              Login
            </NavLink>
            <Link
              href={isPreview ? "#" : `/schools/${school.slug}/enroll`}
              className="border border-white px-4 py-2 text-white transition-colors hover:bg-white hover:text-stone-900"
            >
              Apply now
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <SchoolFooter school={school} site={site} />
        </div>
      </footer>
    </div>
  );
}

function ClassicShell({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="bg-stone-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-[11px] uppercase tracking-[0.16em] text-white/70">
          <span>Public school site</span>
          <SocialLinks social={site.social} light className="gap-3" />
        </div>
      </div>
      <div className="h-[3px]" style={{ backgroundColor: accent }} />
      <div className="relative">
        <header className="absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-6 px-6 py-5">
            <Link href={base} className="text-white">
              <span className="block text-xl font-bold tracking-tight drop-shadow md:text-2xl">
                {school.name}
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">
                Excellence · Integrity · Inclusivity
              </span>
            </Link>
            <div className="hidden flex-col items-end gap-3 sm:flex">
              <div className="flex items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
                <NavLink href={`${base}#about`} className="text-white">
                  About
                </NavLink>
                <NavLink
                  href={isPreview ? "#events" : `/schools/${school.slug}/events`}
                  className="text-white"
                >
                  Calendar
                </NavLink>
                <NavLink href="/login" className="text-white">
                  Login
                </NavLink>
                <Link
                  href={isPreview ? "#" : `/schools/${school.slug}/enroll`}
                  className="border border-white px-4 py-2 text-white transition-colors hover:bg-white hover:text-stone-900"
                >
                  Apply now
                </Link>
              </div>
              <nav className="flex items-center gap-6 text-sm font-medium text-white">
                <NavLink href={`${base}#programs`} className="text-white">
                  Academics
                </NavLink>
                <NavLink href={`${base}#gallery`} className="text-white">
                  Campus life
                </NavLink>
                <NavLink href={`${base}#contact`} className="text-white">
                  Community
                </NavLink>
              </nav>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
      <footer className="py-10 text-white" style={{ backgroundColor: primary }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 h-[2px] w-16" style={{ backgroundColor: accent }} />
          <SchoolFooter school={school} site={site} light />
        </div>
      </footer>
    </div>
  );
}

function MinimalShell({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const primary = school.theme_primary_color ?? "#1a2b56";
  const accent = school.theme_secondary_color ?? "#c9a227";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="font-editorial min-h-screen bg-white text-stone-900">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="h-px" style={{ backgroundColor: accent }} />
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Link href={base} className="text-white">
            <span className="block text-base font-semibold tracking-tight drop-shadow">
              {school.name}
            </span>
          </Link>
          <nav className="flex flex-wrap justify-end gap-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
            <NavLink href={`${base}#programs`} className="text-white">
              Programs
            </NavLink>
            <NavLink href={`${base}#about`} className="text-white">
              About
            </NavLink>
            <NavLink
              href={isPreview ? "#events" : `/schools/${school.slug}/events`}
              className="text-white"
            >
              Events
            </NavLink>
            <NavLink href={`${base}#contact`} className="text-white">
              Contact
            </NavLink>
            <Link
              href={isPreview ? "#" : `/schools/${school.slug}/enroll`}
              className="border border-white/80 px-3 py-1.5 text-white"
            >
              Apply
            </Link>
          </nav>
        </div>
      </header>
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

export function SchoolSiteLayout({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const template = (school.website_template ?? "modern") as WebsiteTemplateId;

  switch (template) {
    case "classic":
      return (
        <ClassicShell school={school} isPreview={isPreview}>
          {children}
        </ClassicShell>
      );
    case "minimal":
      return (
        <MinimalShell school={school} isPreview={isPreview}>
          {children}
        </MinimalShell>
      );
    default:
      return (
        <ModernShell school={school} isPreview={isPreview}>
          {children}
        </ModernShell>
      );
  }
}
