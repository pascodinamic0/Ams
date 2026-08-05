import Link from "next/link";
import { BrandLogo } from "@/components/company/brand-logo";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchools } from "@/lib/db";

export default async function SchoolsDirectoryPage() {
  const schools = await getSchools({ publicOnly: true });

  return (
    <div className="marketing-surface min-h-screen">
      <header className="border-b border-mkt-ink/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" aria-label="ShuleOS home">
              <BrandLogo size={32} />
            </Link>
            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
                Directory
              </p>
              <h1 className="font-display text-lg tracking-tight text-mkt-ink">
                Find a School
              </h1>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-mkt-ink/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
          >
            Staff login
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="sm:hidden">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            Directory
          </p>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-mkt-ink">
            Find a School
          </h1>
        </div>
        <p className="mt-3 max-w-xl text-sm uppercase tracking-[0.14em] text-mkt-ink/50 sm:mt-0">
          Browse schools with public websites
        </p>

        {schools.length === 0 ? (
          <div className="mt-12 border border-mkt-ink/10 p-8">
            <EmptyState
              title="No schools yet"
              description="Schools will appear here when they enable their public site"
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((s) => (
              <Link
                key={s.slug}
                href={`/schools/${s.slug}`}
                className="border border-mkt-ink/10 p-6 transition-colors hover:border-mkt-ink/30"
              >
                {s.logo_url ? (
                  // School logos are remote URLs from storage; keep native img for directory cards.
                  <img
                    src={s.logo_url}
                    alt=""
                    className="mb-3 h-10 w-10 rounded object-cover"
                  />
                ) : null}
                <h3 className="font-semibold text-mkt-ink">{s.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-mkt-ink/50">
                  {s.about ?? "Visit our school website"}
                </p>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-sm text-mkt-ink/40">
          Looking for the platform?{" "}
          <Link href="/get-access" className="text-amber-500 hover:text-amber-400">
            Get access for your school
          </Link>
        </p>
      </main>
    </div>
  );
}
