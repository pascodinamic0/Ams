"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { BrandLogo } from "@/components/company/brand-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { companyIdentity } from "@/lib/company/identity";
import type { CompanyFooterLabels } from "@/lib/company/layout-labels";

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium text-white/55 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({
  className = "",
  labels,
}: {
  className?: string;
  labels: CompanyFooterLabels;
}) {
  const platformLinks = [
    { label: labels.features, href: "/features" },
    { label: labels.getAccess, href: "/get-access" },
    { label: labels.login, href: "/login" },
    { label: labels.register, href: "/register" },
  ];

  const legalLinks = [
    { label: labels.privacyPolicy, href: "/privacy" },
    { label: labels.termsOfService, href: "/terms" },
    { label: labels.cookiePolicy, href: "/cookies" },
  ];

  const supportLinks = [
    { label: labels.documentation, href: "/docs" },
    { label: labels.contact, href: "/contact" },
    { label: labels.forgotPassword, href: "/forgot-password" },
  ];

  const socialLinks = [
    { label: "LinkedIn", href: companyIdentity.social.linkedin, icon: Linkedin },
    { label: "Facebook", href: companyIdentity.social.facebook, icon: Facebook },
    { label: "Instagram", href: companyIdentity.social.instagram, icon: Instagram },
    { label: "YouTube", href: companyIdentity.social.youtube, icon: Youtube },
  ];

  return (
    <footer className={`border-t border-white/10 bg-black py-16 md:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-6 lg:col-span-4">
            <Link href="/">
              <BrandLogo variant="light" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/50">
              {companyIdentity.tagline} — {labels.taglineSuffix} {companyIdentity.origin}.
            </p>
            <div className="space-y-3 text-sm text-white/60">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>{companyIdentity.office.addressFormatted}</span>
              </p>
              <a
                href={`mailto:${companyIdentity.contact.email}`}
                className="inline-flex items-center gap-2 font-medium transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                {companyIdentity.contact.email}
              </a>
              <a
                href={`tel:${companyIdentity.contact.phone}`}
                className="flex items-center gap-2 font-medium transition-colors hover:text-white"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/55 transition-colors hover:border-white hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <FooterLinkList title={labels.platform} links={platformLinks} />
            <FooterLinkList title={labels.legal} links={legalLinks} />
            <FooterLinkList title={labels.support} links={supportLinks} />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} {companyIdentity.legalName}. {labels.copyright}{" "}
            {companyIdentity.productName} {labels.productOf}{" "}
            <a
              href={companyIdentity.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-500 hover:text-amber-400"
            >
              Digni Digital
            </a>
            .
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/40">
            <LanguageSwitcher variant="buttons" tone="marketing" />
            <Link href="/privacy" className="transition-colors hover:text-white">
              {labels.privacy}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              {labels.terms}
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-white">
              {labels.cookies}
            </Link>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {labels.allSystemsOperational}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
