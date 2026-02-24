import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
            The operating system for schools
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            One-stop solution to manage, track, and automate your school and
            organization. Clean dashboard, detailed analytics, four-way
            interaction between management, teachers, parents, and students.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/features"
              className="rounded-lg bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              See all features
            </Link>
            <Link
              href="/get-access"
              className="rounded-lg border border-zinc-300 px-6 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Get access as a school
            </Link>
            <Link
              href="/schools"
              className="rounded-lg border border-zinc-300 px-6 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Find a school
            </Link>
          </div>
        </div>
      </section>
      <section className="border-t border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Key modules
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Academic", desc: "Students, classes, attendance, grades" },
              { title: "Finance", desc: "Fees, invoices, payroll, reports" },
              { title: "Operations", desc: "Library, transport, events" },
              { title: "Portals", desc: "Parent & student dashboards" },
            ].map((m) => (
              <div
                key={m.title}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
