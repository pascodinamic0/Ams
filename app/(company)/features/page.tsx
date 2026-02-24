import Link from "next/link";

const FEATURES = [
  {
    title: "Platform Admin",
    items: ["Schools & branches", "Users & roles", "Audit logs", "Feature toggles"],
  },
  {
    title: "Academic",
    items: ["Students", "Guardians", "Admissions", "Classes & sections", "Timetable", "Curriculum"],
  },
  {
    title: "Teacher",
    items: ["Attendance", "Gradebook", "Assignments", "Exams", "Report cards", "Messages"],
  },
  {
    title: "Finance",
    items: ["Fee structure", "Invoices", "Payments", "Payroll", "Expenses", "Reports"],
  },
  {
    title: "Operations",
    items: ["Library", "Transport", "Events", "Staff/HR"],
  },
  {
    title: "Parent Portal",
    items: ["Child performance", "Fees & payments", "Timetable", "Messages", "Events"],
  },
  {
    title: "Student Portal",
    items: ["Assignments", "Grades", "Library", "Messages", "Events"],
  },
  {
    title: "Analytics",
    items: ["Dashboards", "Branch performance", "Student analytics", "Attendance reports", "Financial reports"],
  },
  {
    title: "School Public Websites",
    items: ["Branded homepage", "Online admissions", "3 templates (Modern, Classic, Minimal)"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Features
      </h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Visual outline of every functionality in the AMS platform.
      </p>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {f.title}
            </h2>
            <ul className="mt-4 space-y-2">
              {f.items.map((item) => (
                <li key={item} className="text-sm text-zinc-600 dark:text-zinc-400">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 flex justify-center gap-4">
        <Link
          href="/get-access"
          className="rounded-lg bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800"
        >
          Get Access
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-6 py-3 hover:bg-zinc-50 dark:border-zinc-700"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
