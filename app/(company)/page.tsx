import Link from "next/link";

const roles = [
  {
    badge: "Administrators & Directors",
    title: "Run your entire school from one place",
    description:
      "Get a comprehensive overview of your school — finances, attendance, student performance, and staff — all in one dashboard. Generate reports, manage enrollments, and communicate with parents in a single click.",
    cta: "Explore admin features",
    href: "/features#admin",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    badge: "Teachers & Educators",
    title: "Spend less time on admin, more on teaching",
    description:
      "Take attendance, enter grades, create assignments, and generate report cards — all from your dashboard. Reuse content across classes and send targeted messages to students and parents.",
    cta: "Explore teacher features",
    href: "/features#teacher",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    badge: "Parents & Students",
    title: "Stay connected to school, always",
    description:
      "Parents track grades, fees, timetables, and assignments in real time. Students submit work, view their schedule, and message teachers — from any device, anywhere.",
    cta: "Explore parent & student features",
    href: "/features#parent",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const modules = [
  {
    icon: "🎓",
    title: "Academic",
    desc: "Students, classes, timetable, attendance, grades, report cards",
  },
  {
    icon: "💰",
    title: "Finance",
    desc: "Fee structure, invoices, payments, payroll, expense tracking",
  },
  {
    icon: "🏫",
    title: "Operations",
    desc: "Library, transport, events, staff management",
  },
  {
    icon: "📊",
    title: "Analytics",
    desc: "Dashboards, branch comparison, attendance & finance reports",
  },
  {
    icon: "💬",
    title: "Messaging",
    desc: "Real-time messages between teachers, parents, and students",
  },
  {
    icon: "🌐",
    title: "School Websites",
    desc: "Each school gets a branded public site with online admissions",
  },
];

const stats = [
  { value: "8", label: "user roles supported" },
  { value: "76+", label: "pages & flows" },
  { value: "1", label: "platform for all schools" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 pb-24 pt-20 md:pb-32 md:pt-28">
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-1.5 text-sm font-medium text-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            The operating system for schools
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Manage every part{" "}
            <br className="hidden sm:block" />
            <span className="text-indigo-300">of your school</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100/80">
            One-stop solution to manage, track, and automate your school.
            Dashboards for admins, teachers, parents, and students — all
            connected in real time.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/get-access"
              className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-indigo-900 shadow-lg transition hover:bg-indigo-50"
            >
              Get access as a school
            </Link>
            <Link
              href="/features"
              className="rounded-xl border border-indigo-400/40 bg-indigo-800/50 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-indigo-700/60"
            >
              See all features →
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-10 border-t border-indigo-700/50 pt-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-sm text-indigo-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role sections */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Built for everyone in your school
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Each role gets a dedicated experience — not a one-size-fits-all dashboard.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {roles.map((role, i) => (
              <div
                key={role.badge}
                className={`rounded-2xl border p-8 transition-shadow hover:shadow-md ${
                  i === 0
                    ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    i === 0
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {role.icon}
                </div>
                <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {role.badge}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {role.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {role.description}
                </p>
                <Link
                  href={role.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {role.cta}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Everything your school needs
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Six fully integrated modules, all talking to each other.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="text-2xl">{m.icon}</span>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-indigo-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to simplify your school?
          </h2>
          <p className="mt-4 text-indigo-100">
            Get started in minutes. Set up your school, invite your team, and go.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/get-access"
              className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-indigo-700 shadow transition hover:bg-indigo-50"
            >
              Get access as a school
            </Link>
            <Link
              href="/schools"
              className="rounded-xl border border-indigo-400 bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Find a school
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
