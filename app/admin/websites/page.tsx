import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchools } from "@/lib/db";
import { SchoolStatusBadge } from "../schools/school-status-badge";

export default async function AdminWebsitesPage() {
  const schools = await getSchools();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">School Websites</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Manage public school sites, templates, and all homepage content from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/websites/templates">
            <Button variant="outline">Browse templates</Button>
          </Link>
          <Link href="/admin/schools/new">
            <Button>Add school</Button>
          </Link>
        </div>
      </div>

      {schools.length === 0 ? (
        <EmptyState
          title="No schools yet"
          description="Add a school to configure its public website"
          action={
            <Link href="/admin/schools/new">
              <Button>Add school</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {schools.map((school) => (
            <div
              key={school.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{school.name}</h2>
                  <SchoolStatusBadge status={school.status} />
                  {school.public_site_enabled ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Live
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {school.public_site_enabled
                    ? `/schools/${school.slug}`
                    : "Public site disabled"}
                  {school.website_template && (
                    <span className="ml-2 capitalize">({school.website_template} template)</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {school.public_site_enabled && (
                  <a href={`/schools/${school.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">Preview</Button>
                  </a>
                )}
                <Link href={`/admin/websites/${school.id}`}>
                  <Button>Customize</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
