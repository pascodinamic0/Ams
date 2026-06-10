"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updateSchool } from "@/lib/actions/schools";
import type { SchoolRow } from "@/lib/db/schools";
import { toast } from "@/lib/toast";

const TEMPLATES = ["modern", "classic", "minimal"] as const;

export function WebsiteConfigForm({ school }: { school: SchoolRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    slug: school.slug,
    logo_url: school.logo_url ?? "",
    theme_primary_color: school.theme_primary_color ?? "#3b82f6",
    theme_secondary_color: school.theme_secondary_color ?? "#1d4ed8",
    website_template: (school.website_template ?? "modern") as
      | "modern"
      | "classic"
      | "minimal",
    public_site_enabled: school.public_site_enabled ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await updateSchool(school.id, {
      slug: form.slug,
      logo_url: form.logo_url || undefined,
      theme_primary_color: form.theme_primary_color,
      theme_secondary_color: form.theme_secondary_color,
      website_template: form.website_template,
      public_site_enabled: form.public_site_enabled,
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Website settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-6">
      <div>
        <Label>Public URL slug</Label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-zinc-500">/schools/</span>
          <Input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label>Logo URL</Label>
        <Input
          type="url"
          placeholder="https://..."
          value={form.logo_url}
          onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Primary color</Label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={form.theme_primary_color}
              onChange={(e) =>
                setForm((f) => ({ ...f, theme_primary_color: e.target.value }))
              }
              className="h-10 w-12 cursor-pointer rounded border"
            />
            <Input
              value={form.theme_primary_color}
              onChange={(e) =>
                setForm((f) => ({ ...f, theme_primary_color: e.target.value }))
              }
            />
          </div>
        </div>
        <div>
          <Label>Secondary color</Label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={form.theme_secondary_color}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  theme_secondary_color: e.target.value,
                }))
              }
              className="h-10 w-12 cursor-pointer rounded border"
            />
            <Input
              value={form.theme_secondary_color}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  theme_secondary_color: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Website template</Label>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, website_template: t }))}
              className={`rounded-lg border-2 p-4 text-left capitalize ${
                form.website_template === t
                  ? "border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Checkbox
        label="Public site enabled"
        checked={form.public_site_enabled}
        onChange={(e) =>
          setForm((f) => ({ ...f, public_site_enabled: e.target.checked }))
        }
      />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
        {form.public_site_enabled && (
          <a
            href={`/schools/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-600 hover:underline"
          >
            Preview site
          </a>
        )}
      </div>
    </form>
  );
}
