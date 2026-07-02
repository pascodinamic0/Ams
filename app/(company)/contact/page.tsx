import Link from "next/link";
import { Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { companyIdentity } from "@/lib/company/identity";
import { getTranslations } from "next-intl/server";

const { office, contact } = companyIdentity;

export default async function ContactPage() {
  const t = await getTranslations("marketing.contact");

  const channels = [
    {
      icon: Mail,
      title: t("generalEnquiries"),
      detail: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      icon: MessageSquare,
      title: t("whatsappSupport"),
      detail: contact.phoneDisplay,
      href: contact.whatsappUrl,
    },
    {
      icon: Mail,
      title: t("technicalSupport"),
      detail: contact.supportEmail,
      href: `mailto:${contact.supportEmail}`,
    },
    {
      icon: Clock,
      title: t("supportHours"),
      detail: office.supportHours,
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] dark:bg-[#0c1222] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span aria-hidden>🇰🇪</span>
          {companyIdentity.origin}
        </p>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-stone-900 dark:text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">
          {t("subtitle")}
        </p>

        <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900/50">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary dark:bg-primary-light dark:text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-stone-900 dark:text-white">
                {office.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                {office.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p className="mt-2 text-xs font-medium text-stone-400">
                {office.timezone}
              </p>
              <a
                href={`tel:${contact.phone}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover dark:text-primary"
              >
                <Phone className="h-4 w-4" />
                {contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {channels.map(({ icon: Icon, title, detail, href }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary dark:bg-primary-light dark:text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-white">
                  {title}
                </p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-1 text-sm text-primary hover:text-primary-hover dark:text-primary"
                  >
                    {detail}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-stone-500 dark:text-stone-400">
          {t("legalNote")}{" "}
          <Link
            href="/privacy"
            className="font-medium text-primary hover:text-primary-hover dark:text-primary"
          >
            {t("privacyPolicy")}
          </Link>{" "}
          {t("orEmail")}{" "}
          <a
            href={`mailto:${contact.legalEmail}`}
            className="font-medium text-primary hover:text-primary-hover dark:text-primary"
          >
            {contact.legalEmail}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
