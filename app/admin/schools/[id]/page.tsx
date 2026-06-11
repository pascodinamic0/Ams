import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ExternalLink,
  Globe,
  LayoutTemplate,
  Palette,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyableBadge } from "@/components/ui/copyable-badge";
import { getSchoolById } from "@/lib/db";
import { getWebsiteTemplate } from "@/lib/schools/website-templates";
import { SchoolStatusActions } from "../school-status-actions";
import { SchoolStatusBadge } from "../school-status-badge";
import { SchoolEditForm } from "./school-edit-form";

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolById(id);
  if (!school) notFound();

  const template = getWebsiteTemplate(school.website_template ?? "modern");
  const publicUrl = `/schools/${school.slug}`;
  const isLive = school.public_site_enabled ?? false;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/schools"
          className="text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          &larr; Schools
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {school.name}
              </h1>
              <SchoolStatusBadge status={school.status ?? "pending"} />
              {isLive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  Hidden
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CopyableBadge value={school.code} label={`Code: ${school.code}`} />
              <CopyableBadge value={school.slug} label={`/${school.slug}`} />
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Created {format(new Date(school.created_at), "MMM d, yyyy")}
              {school.updated_at !== school.created_at && (
                <> &middot; Updated {format(new Date(school.updated_at), "MMM d, yyyy")}</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isLive && (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Preview site
                </Button>
              </a>
            )}
            <Link href={`/admin/websites/${id}`}>
              <Button className="gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Customize website
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Public URL
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900 dark:text-white">
                {isLive ? publicUrl : "Site disabled"}
              </p>
              {school.custom_domain && (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {school.custom_domain}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Website template
              </p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {template?.name ?? "Modern"}
              </p>
              {template && (
                <p className="mt-0.5 text-xs text-slate-500">{template.tagline}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Brand colors
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700"
                  style={{
                    backgroundColor: school.theme_primary_color ?? "#4f46e5",
                  }}
                  title="Primary"
                />
                <span
                  className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700"
                  style={{
                    backgroundColor: school.theme_secondary_color ?? "#7c3aed",
                  }}
                  title="Secondary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SchoolEditForm school={school} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-slate-500" />
                Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Approve, suspend, or remove this school from the platform.
              </p>
              <SchoolStatusActions
                schoolId={school.id}
                schoolName={school.name}
                status={school.status ?? "pending"}
                redirectAfterDelete
                stacked
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/admin/websites/${id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Website editor
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </Link>
              {template && (
                <a
                  href={template.previewPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Template preview
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </a>
              )}
              <Link
                href="/admin/schools/templates"
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Browse templates
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
