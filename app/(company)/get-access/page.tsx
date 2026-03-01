import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Register your school",
    desc: "Create your school account with your name and admin email. Takes 60 seconds.",
  },
  {
    number: "02",
    title: "Complete onboarding",
    desc: "A guided 4-step wizard walks you through domain, colors, and your public site template.",
  },
  {
    number: "03",
    title: "Invite your team",
    desc: "Add teachers, finance officers, and other admins — each gets a role-specific dashboard.",
  },
  {
    number: "04",
    title: "Go live",
    desc: "Your school portal and public website are ready. Parents and students can start using it today.",
  },
];

const included = [
  "Admin & academic management",
  "Teacher portal (attendance, grades, assignments)",
  "Finance & invoicing",
  "Parent & student portals",
  "School public website with online admissions",
  "Analytics & reporting dashboards",
  "Real-time messaging",
  "Library & transport management",
];

export default function GetAccessPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Get started in minutes
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Get access as a school
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500 dark:text-slate-400">
            No setup fees. No long contracts. Sign up, complete onboarding, and
            your school is running on AMS — today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Create school account
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.number} className="relative">
                <span className="text-4xl font-bold text-indigo-100 dark:text-indigo-950">
                  {s.number}
                </span>
                <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Everything included
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              One platform, all the tools your school needs from day one.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                  <svg
                    className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-block rounded-xl bg-indigo-600 px-10 py-4 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
            >
              Get started — it&apos;s free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
