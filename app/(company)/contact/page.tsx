import Link from "next/link";
import { Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { companyIdentity } from "@/lib/company/identity";

const { office, contact } = companyIdentity;

const channels = [
  {
    icon: Mail,
    title: "General enquiries",
    detail: contact.email,
    href: `mailto:${contact.email}`,
  },
  {
    icon: MessageSquare,
    title: "WhatsApp support",
    detail: contact.phoneDisplay,
    href: contact.whatsappUrl,
  },
  {
    icon: Mail,
    title: "Technical support",
    detail: contact.supportEmail,
    href: `mailto:${contact.supportEmail}`,
  },
  {
    icon: Clock,
    title: "Support hours",
    detail: office.supportHours,
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 dark:bg-[#0a0f1e]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span aria-hidden>🇰🇪</span>
          {companyIdentity.origin}
        </p>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
          Contact us
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
          Whether you&apos;re onboarding a new school in Kenya or need help with
          an existing account, our Nairobi team is here to help.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {office.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {office.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-400">
                {office.timezone}
              </p>
              <a
                href={`tel:${contact.phone}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
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
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {title}
                </p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    {detail}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">
          For legal or privacy matters, see our{" "}
          <Link
            href="/privacy"
            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Privacy Policy
          </Link>{" "}
          or email{" "}
          <a
            href={`mailto:${contact.legalEmail}`}
            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            {contact.legalEmail}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
