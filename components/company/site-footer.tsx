import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { BrandLogo } from "@/components/company/brand-logo";
import { companyIdentity } from "@/lib/company/identity";

const platformLinks = [
  { label: "Features", href: "/features" },
  { label: "Get Access", href: "/get-access" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];

const supportLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "Contact", href: "/contact" },
  { label: "Forgot Password", href: "/forgot-password" },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: companyIdentity.social.linkedin,
    icon: Linkedin,
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: Youtube,
  },
];

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-[#060a16] md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="space-y-6 lg:col-span-4">
            <Link href="/">
              <BrandLogo wordmarkClassName="text-slate-900 dark:text-white" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {companyIdentity.tagline} — manage academics, finance, staff, and
              parent communication from one platform. {companyIdentity.origin}.
            </p>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span aria-hidden>🌍</span>
                {companyIdentity.origin}
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <span>{companyIdentity.office.addressFormatted}</span>
              </p>
              <a
                href={`mailto:${companyIdentity.contact.email}`}
                className="inline-flex items-center gap-2 font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Mail className="h-4 w-4" />
                {companyIdentity.contact.email}
              </a>
              <a
                href={`tel:${companyIdentity.contact.phone}`}
                className="flex items-center gap-2 font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Phone className="h-4 w-4" />
                {companyIdentity.contact.phoneDisplay}
              </a>
            </div>
            <div className="flex gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-600 dark:hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <FooterLinkList title="Platform" links={platformLinks} />
            <FooterLinkList title="Legal" links={legalLinks} />
            <FooterLinkList title="Support" links={supportLinks} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 md:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} {companyIdentity.legalName}. All
            rights reserved. {companyIdentity.productName} is a product of{" "}
            <a
              href={companyIdentity.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Digni Digital
            </a>
            .
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/privacy"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Cookies
            </Link>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
