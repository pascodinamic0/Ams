import Link from "next/link";
import { Mail, MessageSquare, Clock } from "lucide-react";

const channels = [
  {
    icon: Mail,
    title: "General enquiries",
    detail: "hello@ams.education",
    href: "mailto:hello@ams.education",
  },
  {
    icon: MessageSquare,
    title: "Technical support",
    detail: "support@ams.education",
    href: "mailto:support@ams.education",
  },
  {
    icon: Clock,
    title: "Support hours",
    detail: "Mon-Fri, 8:00 AM - 6:00 PM (WAT)",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 dark:bg-[#0a0f1e]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
          Contact us
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
          Whether you&apos;re onboarding a new school or need help with an existing
          account, we&apos;re here to help.
        </p>

        <div className="mt-12 space-y-4">
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
            href="mailto:legal@ams.education"
            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            legal@ams.education
          </a>
          .
        </p>
      </div>
    </div>
  );
}
