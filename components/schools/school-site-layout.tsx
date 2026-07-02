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
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`text-sm transition-opacity hover:opacity-70 ${className}`}>
      {children}
    </Link>
  );
}

function SocialLinks({
  social,
  className = "",
}: {
  social: { facebook?: string; instagram?: string; twitter?: string };
  className?: string;
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
          className="text-sm text-stone-500 hover:text-zinc-800 dark:hover:text-zinc-200"
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
}: {
  school: SchoolRow;
  site: ReturnType<typeof resolveSchoolWebsite>;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm text-stone-500">
        &copy; {new Date().getFullYear()} {school.name}
      </p>
      {site.footerTagline && (
        <p className="mt-1 text-sm text-stone-400">{site.footerTagline}</p>
      )}
      <SocialLinks social={site.social} className="mt-3" />
    </div>
  );
}

function ModernShell({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const primary = school.theme_primary_color ?? "#0d9488";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href={base} className="flex items-center gap-3">
            {school.logo_url ? (
              <img src={school.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: primary }}
              >
                {school.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold tracking-tight">{school.name}</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <NavLink href={`${base}#programs`}>Programs</NavLink>
            <NavLink href={`${base}#about`}>About</NavLink>
            <NavLink href={isPreview ? "#events" : `/schools/${school.slug}/events`}>Events</NavLink>
            <NavLink href={`${base}#contact`}>Contact</NavLink>
            <NavLink href="/login">Login</NavLink>
            <Link
              href={isPreview ? "#" : `/schools/${school.slug}/enroll`}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              Enroll
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-zinc-100 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <SchoolFooter school={school} site={site} />
        </div>
      </footer>
    </div>
  );
}

function ClassicShell({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const primary = school.theme_primary_color ?? "#1e3a8a";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen bg-amber-50/40 text-stone-900">
      <header className="border-b-2 bg-white" style={{ borderColor: primary }}>
        <div className="mx-auto max-w-4xl px-6 py-5 text-center">
          <Link href={base}>
            {school.logo_url && (
              <img
                src={school.logo_url}
                alt=""
                className="mx-auto mb-3 h-14 w-14 object-cover"
              />
            )}
            <p className="font-serif text-2xl font-bold tracking-wide" style={{ color: primary }}>
              {school.name}
            </p>
          </Link>
          <nav className="mt-4 flex flex-wrap justify-center gap-6 font-serif text-sm">
            <NavLink href={`${base}#programs`}>Programs</NavLink>
            <NavLink href={`${base}#about`}>About</NavLink>
            <NavLink href={isPreview ? "#events" : `/schools/${school.slug}/events`}>Events</NavLink>
            <NavLink href={`${base}#contact`}>Contact</NavLink>
            <NavLink href="/login">Login</NavLink>
            <NavLink href={isPreview ? "#" : `/schools/${school.slug}/enroll`}>
              Enroll
            </NavLink>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t-2 border-stone-300 bg-white py-8 text-center dark:border-stone-700">
        <SchoolFooter school={school} site={site} className="mx-auto max-w-4xl px-6" />
      </footer>
    </div>
  );
}

function MinimalShell({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const primary = school.theme_primary_color ?? "#18181b";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <header className="mx-auto max-w-2xl px-6 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <Link
            href={base}
            className="text-sm font-medium tracking-wide"
            style={{ color: primary }}
          >
            {school.name}
          </Link>
          <nav className="flex flex-wrap justify-end gap-5 text-xs uppercase tracking-widest text-stone-400">
            <NavLink href={`${base}#programs`}>Programs</NavLink>
            <NavLink href={`${base}#about`}>About</NavLink>
            <NavLink href={isPreview ? "#events" : `/schools/${school.slug}/events`}>Events</NavLink>
            <NavLink href="/login">Login</NavLink>
            <NavLink href={isPreview ? "#" : `/schools/${school.slug}/enroll`}>
              Enroll
            </NavLink>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-2xl border-t border-zinc-100 px-6 py-10">
        <SchoolFooter school={school} site={site} />
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
