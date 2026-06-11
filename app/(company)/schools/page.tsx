import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchools } from "@/lib/db";

export default async function SchoolsDirectoryPage() {
  const schools = await getSchools({ publicOnly: true });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Directory
            </p>
            <h1 className="text-lg font-semibold">Find a School</h1>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Staff login
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Browse schools with public websites</p>
        {schools.length === 0 ? (
          <EmptyState
            title="No schools yet"
            description="Schools will appear here when they enable their public site"
          />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((s) => (
              <Link
                key={s.slug}
                href={`/schools/${s.slug}`}
                className="rounded-lg border border-zinc-200 bg-white p-6 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                {s.logo_url && (
                  <img
                    src={s.logo_url}
                    alt=""
                    className="mb-3 h-10 w-10 rounded object-cover"
                  />
                )}
                <h3 className="font-semibold">{s.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {s.about ?? "Visit our school website"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
