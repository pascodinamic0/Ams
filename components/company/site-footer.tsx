"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/company/brand-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { companyIdentity } from "@/lib/company/identity";

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium text-stone-500 transition-colors hover:text-primary dark:text-stone-400 dark:hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ className = "" }: { className?: string }) {
  const t = useTranslations("marketing.footer");
  const tNav = useTranslations("marketing.nav");

  const platformLinks = [
    { label: tNav("features"), href: "/features" },
    { label: tNav("getAccess"), href: "/get-access" },
    { label: tNav("login"), href: "/login" },
    { label: tNav("register"), href: "/register" },
  ];

  const legalLinks = [
    { label: t("privacyPolicy"), href: "/privacy" },
    { label: t("termsOfService"), href: "/terms" },
    { label: t("cookiePolicy"), href: "/cookies" },
  ];

  const supportLinks = [
    { label: t("documentation"), href: "/docs" },
    { label: t("contact"), href: "/contact" },
    { label: t("forgotPassword"), href: "/forgot-password" },
  ];

  const socialLinks = [
    { label: "LinkedIn", href: companyIdentity.social.linkedin, icon: Linkedin },
    { label: "Facebook", href: "https://facebook.com", icon: Facebook },
    { label: "Instagram", href: "https://instagram.com", icon: Instagram },
    { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  ];

  return (
    <footer className={`border-t border-stone-200 bg-stone-50 py-16 dark:border-stone-800 dark:bg-[#0c1222] md:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-6 lg:col-span-4">
            <Link href="/">
              <BrandLogo wordmarkClassName="text-stone-900 dark:text-white" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              {companyIdentity.tagline} — {t("taglineSuffix")} {companyIdentity.origin}.
            </p>
            <div className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{companyIdentity.office.addressFormatted}</span>
              </p>
              <a
                href={`mailto:${companyIdentity.contact.email}`}
                className="inline-flex items-center gap-2 font-medium transition-colors hover:text-primary dark:hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                {companyIdentity.contact.email}
              </a>
              <a
                href={`tel:${companyIdentity.contact.phone}`}
                className="flex items-center gap-2 font-medium transition-colors hover:text-primary dark:hover:text-primary"
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-200 text-stone-600 transition-colors hover:bg-primary hover:text-white dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-primary dark:hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <FooterLinkList title={t("platform")} links={platformLinks} />
            <FooterLinkList title={t("legal")} links={legalLinks} />
            <FooterLinkList title={t("support")} links={supportLinks} />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 dark:border-stone-800 md:flex-row">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            &copy; {new Date().getFullYear()} {companyIdentity.legalName}. {t("copyright")}{" "}
            {companyIdentity.productName} {t("productOf")}{" "}
            <a
              href={companyIdentity.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary-hover dark:text-primary"
            >
              Digni Digital
            </a>
            .
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
            <LanguageSwitcher variant="buttons" className="bg-stone-200 dark:bg-stone-800" />
            <Link href="/privacy" className="transition-colors hover:text-primary dark:hover:text-primary">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary dark:hover:text-primary">
              {t("terms")}
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-primary dark:hover:text-primary">
              {t("cookies")}
            </Link>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("allSystemsOperational")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
