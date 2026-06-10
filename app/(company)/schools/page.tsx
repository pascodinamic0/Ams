import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchools } from "@/lib/db";

export default async function SchoolsDirectoryPage() {
  const schools = await getSchools({ publicOnly: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-bold">Find a School</h1>
      <p className="mt-2 text-zinc-600">Browse schools with public sites</p>
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
              className="rounded-lg border p-6 hover:bg-zinc-50"
            >
              {s.logo_url && (
                <img
                  src={s.logo_url}
                  alt=""
                  className="mb-3 h-10 w-10 rounded object-cover"
                />
              )}
              <h3 className="font-semibold">{s.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                {s.about ?? "Visit our school website"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
