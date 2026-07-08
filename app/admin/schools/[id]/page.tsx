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
import { getTranslations } from "next-intl/server";
import { SchoolStatusActions } from "../school-status-actions";
import { SchoolStatusBadge } from "../school-status-badge";
import { SchoolEditForm } from "./school-edit-form";
import { SchoolCurrencyForm } from "@/components/schools/school-currency-form";

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("admin");
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
          className="text-sm text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
        >
          &larr; {t("backToSchools")}
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                {school.name}
              </h1>
              <SchoolStatusBadge status={school.status ?? "pending"} />
              {isLive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t("live")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {t("hidden")}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CopyableBadge value={school.code} label={t("codeLabel", { code: school.code })} />
              <CopyableBadge value={school.slug} label={`/${school.slug}`} />
            </div>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {t("createdOn", { date: format(new Date(school.created_at), "MMM d, yyyy") })}
              {school.updated_at !== school.created_at && (
                <> &middot; {t("updatedOn", { date: format(new Date(school.updated_at), "MMM d, yyyy") })}</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isLive && (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {t("previewSite")}
                </Button>
              </a>
            )}
            <Link href={`/admin/websites/${id}`}>
              <Button className="gap-2">
                <LayoutTemplate className="h-4 w-4" />
                {t("customizeWebsite")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-primary-light p-2.5 text-primary dark:bg-primary-light/40 dark:text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                {t("publicUrl")}
              </p>
              <p className="mt-1 truncate font-semibold text-stone-900 dark:text-white">
                {isLive ? publicUrl : t("siteDisabled")}
              </p>
              {school.custom_domain && (
                <p className="mt-0.5 truncate text-xs text-stone-500">
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
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                {t("websiteTemplate")}
              </p>
              <p className="mt-1 font-semibold text-stone-900 dark:text-white">
                {template?.name ?? "Modern"}
              </p>
              {template && (
                <p className="mt-0.5 text-xs text-stone-500">{template.tagline}</p>
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
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                {t("brandColors")}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700"
                  style={{
                    backgroundColor: school.theme_primary_color ?? "#0d9488",
                  }}
                  title={t("primaryColor")}
                />
                <span
                  className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700"
                  style={{
                    backgroundColor: school.theme_secondary_color ?? "#7c3aed",
                  }}
                  title={t("secondaryColor")}
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
                <Settings2 className="h-4 w-4 text-stone-500" />
                {t("administration")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {t("administrationDesc")}
              </p>
              <SchoolCurrencyForm
                schoolId={school.id}
                currencyCode={school.currency_code}
                title={t("currencyTitle")}
                description={t("currencyDescription")}
                compact
              />
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
              <CardTitle>{t("quickLinks")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/admin/websites/${id}`}
                className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900"
              >
                {t("websiteEditor")}
                <ExternalLink className="h-4 w-4 text-stone-400" />
              </Link>
              {template && (
                <a
                  href={template.previewPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900"
                >
                  {t("templatePreview")}
                  <ExternalLink className="h-4 w-4 text-stone-400" />
                </a>
              )}
              <Link
                href="/admin/schools/templates"
                className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900"
              >
                {t("browseTemplates")}
                <ExternalLink className="h-4 w-4 text-stone-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
