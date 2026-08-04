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
    <div className="min-h-screen bg-[#f4faf9] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-teal-900/5 bg-[#f4faf9]/85 backdrop-blur-md">
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
            <span className="text-base font-bold tracking-tight">{school.name}</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <NavLink href={`${base}#programs`}>Programs</NavLink>
            <NavLink href={`${base}#about`}>About</NavLink>
            <NavLink href={isPreview ? "#events" : `/schools/${school.slug}/events`}>Events</NavLink>
            <NavLink href={`${base}#contact`}>Contact</NavLink>
            <NavLink href="/login">Login</NavLink>
            <Link
              href={isPreview ? "#" : `/schools/${school.slug}/enroll`}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: primary }}
            >
              Fix enrollment delays
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-teal-900/5 bg-white">
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
    <div
      className="min-h-screen text-stone-900"
      style={{
        background:
          "linear-gradient(180deg, #f7f8fb 0%, #ffffff 38%, #eef1f7 100%)",
      }}
    >
      <header className="border-b bg-white/90 backdrop-blur-sm" style={{ borderColor: `${primary}33` }}>
        <div className="mx-auto max-w-5xl px-6 py-6 text-center">
          <Link href={base} className="inline-flex flex-col items-center">
            {school.logo_url && (
              <img
                src={school.logo_url}
                alt=""
                className="mb-3 h-14 w-14 object-cover"
              />
            )}
            <p
              className="font-serif text-3xl font-bold tracking-[0.04em] md:text-4xl"
              style={{ color: primary }}
            >
              {school.name}
            </p>
          </Link>
          <nav className="mt-5 flex flex-wrap justify-center gap-6 font-serif text-sm text-stone-700">
            <NavLink href={`${base}#programs`}>Programs</NavLink>
            <NavLink href={`${base}#about`}>About</NavLink>
            <NavLink href={isPreview ? "#events" : `/schools/${school.slug}/events`}>Events</NavLink>
            <NavLink href={`${base}#contact`}>Contact</NavLink>
            <NavLink href="/login">Login</NavLink>
            <NavLink
              href={isPreview ? "#" : `/schools/${school.slug}/enroll`}
              className="font-semibold"
              style={{ color: primary }}
            >
              Apply before seats fill
            </NavLink>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t bg-white py-8 text-center" style={{ borderColor: `${primary}22` }}>
        <SchoolFooter school={school} site={site} className="mx-auto max-w-4xl px-6" />
      </footer>
    </div>
  );
}

function MinimalShell({ school, children, isPreview }: SchoolSiteLayoutProps) {
  const primary = school.theme_primary_color ?? "#1f2937";
  const site = resolveSchoolWebsite(school);
  const base = isPreview ? "#" : `/schools/${school.slug}`;

  return (
    <div
      className="font-editorial min-h-screen text-stone-900"
      style={{
        background:
          "radial-gradient(ellipse at top, #edf2f0 0%, #f8faf9 42%, #e8eee9 100%)",
      }}
    >
      <header className="mx-auto max-w-3xl px-6 pt-10 pb-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={base}
            className="text-lg font-semibold tracking-tight"
            style={{ color: primary }}
          >
            {school.name}
          </Link>
          <nav className="flex flex-wrap justify-end gap-5 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
            <NavLink href={`${base}#programs`}>Programs</NavLink>
            <NavLink href={`${base}#about`}>About</NavLink>
            <NavLink href={isPreview ? "#events" : `/schools/${school.slug}/events`}>Events</NavLink>
            <NavLink href={`${base}#contact`}>Contact</NavLink>
            <NavLink href="/login">Login</NavLink>
            <NavLink href={isPreview ? "#" : `/schools/${school.slug}/enroll`}>
              Enroll now
            </NavLink>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-3xl border-t border-stone-300/60 px-6 py-10">
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
