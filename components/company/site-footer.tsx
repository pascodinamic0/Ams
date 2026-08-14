"use client";

import Link from "next/link";
import { Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
    <nav aria-label={title} className="min-w-0 space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium text-mkt-ink/55 transition-colors hover:text-mkt-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter({
  className = "",
  labels,
}: {
  className?: string;
  labels: CompanyFooterLabels;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";
  const logoVariant = isDark ? "light" : "default";

  const platformLinks = [
    { label: labels.features, href: "/features" },
    { label: labels.schoolManagementSystem, href: "/school-management-system" },
    { label: labels.logicielGestionScolaire, href: "/logiciel-de-gestion-scolaire" },
    { label: labels.blog, href: "/blog" },
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
  ];

  const legalQuickLinks = [
    { label: labels.privacy, href: "/privacy" },
    { label: labels.terms, href: "/terms" },
    { label: labels.cookies, href: "/cookies" },
  ];

  return (
    <footer className={`border-t border-mkt-ink/10 bg-mkt-canvas py-12 sm:py-16 md:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16 xl:gap-20">
          <div className="max-w-md shrink-0 space-y-6 lg:w-[22rem] xl:w-[24rem]">
            <Link href="/" className="inline-block">
              <BrandLogo variant={logoVariant} />
            </Link>
            <p className="text-sm leading-relaxed text-mkt-ink/50">
              {companyIdentity.tagline} — {labels.taglineSuffix} {companyIdentity.origin}.
            </p>
            <div className="space-y-4 text-sm text-mkt-ink/60">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                <span className="leading-relaxed">
                  {companyIdentity.office.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </p>
              <a
                href={`mailto:${companyIdentity.contact.email}`}
                className="flex items-center gap-3 font-medium transition-colors hover:text-mkt-ink"
              >
                <Mail className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                <span className="break-all">{companyIdentity.contact.email}</span>
              </a>
              <a
                href={`tel:${companyIdentity.contact.phone}`}
                className="flex items-center gap-3 font-medium transition-colors hover:text-mkt-ink"
              >
                <Phone className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-mkt-ink/15 text-mkt-ink/55 transition-colors hover:border-mkt-ink hover:text-mkt-ink"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:gap-x-10">
            <FooterLinkList title={labels.platform} links={platformLinks} />
            <FooterLinkList title={labels.legal} links={legalLinks} />
            <div className="col-span-2 sm:col-span-1">
              <FooterLinkList title={labels.support} links={supportLinks} />
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-6 border-t border-mkt-ink/10 pt-8 sm:mt-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="max-w-xl space-y-1 text-center sm:text-left">
              <p className="text-sm text-mkt-ink/40">
                &copy; {new Date().getFullYear()} {companyIdentity.legalName}. {labels.copyright}
              </p>
              <p className="text-sm text-mkt-ink/40">
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
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6 sm:gap-y-3 lg:justify-end">
              <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:justify-start">
                <LanguageSwitcher variant="buttons" tone="marketing" />
                <span className="mx-2 hidden h-4 w-px bg-mkt-ink/15 sm:inline-block" aria-hidden />
                <nav
                  aria-label={labels.legal}
                  className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-mkt-ink/40 sm:justify-start"
                >
                  {legalQuickLinks.map((link, index) => (
                    <span key={link.href} className="contents">
                      {index > 0 ? (
                        <span className="text-mkt-ink/20 sm:hidden" aria-hidden>
                          ·
                        </span>
                      ) : null}
                      <Link href={link.href} className="transition-colors hover:text-mkt-ink">
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </nav>
              </div>

              <p className="flex items-center gap-2 text-sm text-mkt-ink/40">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                {labels.allSystemsOperational}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
