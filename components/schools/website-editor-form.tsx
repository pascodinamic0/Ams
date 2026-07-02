"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SchoolImageUpload } from "@/components/schools/school-image-upload";
import { TemplatePicker } from "@/components/schools/template-picker";
import { updateSchool } from "@/lib/actions/schools";
import type { SchoolRow } from "@/lib/db/schools";
import {
  parseWebsiteContent,
  type SchoolWebsiteContent,
  type WebsiteGalleryImage,
  type WebsiteProgram,
  type WebsiteStat,
} from "@/lib/schools/website-content";
import type { WebsiteTemplateId } from "@/lib/schools/website-templates";
import { toast } from "@/lib/toast";

type EditorState = {
  slug: string;
  logo_url: string;
  cover_image_url: string;
  about: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  custom_domain: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  website_template: WebsiteTemplateId;
  public_site_enabled: boolean;
  hero_title: string;
  hero_subtitle: string;
  footer_tagline: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  programs: WebsiteProgram[];
  stats: WebsiteStat[];
  gallery: WebsiteGalleryImage[];
};

function schoolToEditorState(school: SchoolRow): EditorState {
  const content = parseWebsiteContent(school.website_content);

  return {
    slug: school.slug,
    logo_url: school.logo_url ?? "",
    cover_image_url: school.cover_image_url ?? "",
    about: school.about ?? "",
    contact_email: school.contact_email ?? "",
    contact_phone: school.contact_phone ?? "",
    address: school.address ?? "",
    custom_domain: school.custom_domain ?? "",
    theme_primary_color: school.theme_primary_color ?? "#0d9488",
    theme_secondary_color: school.theme_secondary_color ?? "#7c3aed",
    website_template: (school.website_template ?? "modern") as WebsiteTemplateId,
    public_site_enabled: school.public_site_enabled ?? true,
    hero_title: content.hero_title ?? "",
    hero_subtitle: content.hero_subtitle ?? "",
    footer_tagline: content.footer_tagline ?? "",
    social_facebook: content.social_facebook ?? "",
    social_instagram: content.social_instagram ?? "",
    social_twitter: content.social_twitter ?? "",
    programs: content.programs ?? [],
    stats: content.stats ?? [],
    gallery: content.gallery ?? [],
  };
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
      )}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function WebsiteEditorForm({ school }: { school: SchoolRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => schoolToEditorState(school));

  function updateProgram(index: number, patch: Partial<WebsiteProgram>) {
    setForm((f) => ({
      ...f,
      programs: f.programs.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }

  function updateStat(index: number, patch: Partial<WebsiteStat>) {
    setForm((f) => ({
      ...f,
      stats: f.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function updateGallery(index: number, patch: Partial<WebsiteGalleryImage>) {
    setForm((f) => ({
      ...f,
      gallery: f.gallery.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const website_content: SchoolWebsiteContent = {
      hero_title: form.hero_title || undefined,
      hero_subtitle: form.hero_subtitle || undefined,
      footer_tagline: form.footer_tagline || undefined,
      social_facebook: form.social_facebook || undefined,
      social_instagram: form.social_instagram || undefined,
      social_twitter: form.social_twitter || undefined,
      programs: form.programs.filter((p) => p.title.trim()),
      stats: form.stats.filter((s) => s.label.trim()),
      gallery: form.gallery.filter((g) => g.url.trim()),
    };

    const result = await updateSchool(school.id, {
      slug: form.slug,
      logo_url: form.logo_url || undefined,
      cover_image_url: form.cover_image_url || undefined,
      about: form.about || undefined,
      contact_email: form.contact_email || undefined,
      contact_phone: form.contact_phone || undefined,
      address: form.address || undefined,
      custom_domain: form.custom_domain || undefined,
      theme_primary_color: form.theme_primary_color,
      theme_secondary_color: form.theme_secondary_color,
      website_template: form.website_template,
      public_site_enabled: form.public_site_enabled,
      website_content,
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Website saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Publishing" description="Control whether the public site is live.">
        <Checkbox
          label="Public site enabled"
          checked={form.public_site_enabled}
          onChange={(e) =>
            setForm((f) => ({ ...f, public_site_enabled: e.target.checked }))
          }
        />
        <div>
          <Label>Public URL slug</Label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-stone-500">/schools/</span>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>
        </div>
        <div>
          <Label>Custom domain (optional)</Label>
          <Input
            placeholder="www.yourschool.edu"
            value={form.custom_domain}
            onChange={(e) => setForm((f) => ({ ...f, custom_domain: e.target.value }))}
          />
        </div>
      </Section>

      <Section title="Hero" description="The first thing visitors see on your homepage.">
        <div>
          <Label>Hero title</Label>
          <Input
            value={form.hero_title}
            onChange={(e) => setForm((f) => ({ ...f, hero_title: e.target.value }))}
            placeholder={`Welcome to ${school.name}`}
          />
        </div>
        <div>
          <Label>Hero subtitle</Label>
          <Textarea
            value={form.hero_subtitle}
            onChange={(e) => setForm((f) => ({ ...f, hero_subtitle: e.target.value }))}
            rows={2}
          />
        </div>
        <SchoolImageUpload
          schoolId={school.id}
          folder="hero"
          label="Hero background image"
          value={form.cover_image_url}
          onChange={(cover_image_url) => setForm((f) => ({ ...f, cover_image_url }))}
        />
      </Section>

      <Section title="Branding">
        <SchoolImageUpload
          schoolId={school.id}
          folder="logo"
          label="School logo"
          value={form.logo_url}
          onChange={(logo_url) => setForm((f) => ({ ...f, logo_url }))}
        />
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
                  setForm((f) => ({ ...f, theme_secondary_color: e.target.value }))
                }
                className="h-10 w-12 cursor-pointer rounded border"
              />
              <Input
                value={form.theme_secondary_color}
                onChange={(e) =>
                  setForm((f) => ({ ...f, theme_secondary_color: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="About">
        <Textarea
          value={form.about}
          onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
          rows={5}
          placeholder="Tell families about your school..."
        />
      </Section>

      <Section title="Programs" description="Highlight key academic and extracurricular offerings.">
        {form.programs.map((program, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 p-4 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500">Program {i + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    programs: f.programs.filter((_, idx) => idx !== i),
                  }))
                }
              >
                Remove
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              <Input
                placeholder="Title"
                value={program.title}
                onChange={(e) => updateProgram(i, { title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={program.description}
                onChange={(e) => updateProgram(i, { description: e.target.value })}
                rows={2}
              />
              <SchoolImageUpload
                schoolId={school.id}
                folder={`programs/${i}`}
                label="Program image"
                value={program.image_url}
                onChange={(image_url) => updateProgram(i, { image_url })}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setForm((f) => ({
              ...f,
              programs: [
                ...f.programs,
                { title: "", description: "", image_url: "" },
              ],
            }))
          }
        >
          Add program
        </Button>
      </Section>

      <Section title="Stats" description="Quick facts shown on the homepage.">
        {form.stats.map((stat, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="Label"
              value={stat.label}
              onChange={(e) => updateStat(i, { label: e.target.value })}
            />
            <Input
              placeholder="Value"
              value={stat.value}
              onChange={(e) => updateStat(i, { value: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  stats: f.stats.filter((_, idx) => idx !== i),
                }))
              }
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setForm((f) => ({
              ...f,
              stats: [...f.stats, { label: "", value: "" }],
            }))
          }
        >
          Add stat
        </Button>
      </Section>

      <Section title="Photo gallery">
        {form.gallery.map((item, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 p-4 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500">Photo {i + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    gallery: f.gallery.filter((_, idx) => idx !== i),
                  }))
                }
              >
                Remove
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              <SchoolImageUpload
                schoolId={school.id}
                folder={`gallery/${i}`}
                label="Photo"
                value={item.url}
                onChange={(url) => updateGallery(i, { url })}
              />
              <div>
                <Label>Caption</Label>
                <Input
                  className="mt-1"
                  placeholder="Optional caption"
                  value={item.caption ?? ""}
                  onChange={(e) => updateGallery(i, { caption: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setForm((f) => ({
              ...f,
              gallery: [...f.gallery, { url: "", caption: "" }],
            }))
          }
        >
          Add photo
        </Button>
      </Section>

      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.contact_phone}
              onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label>Address</Label>
          <Textarea
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            rows={2}
          />
        </div>
      </Section>

      <Section title="Footer & social">
        <div>
          <Label>Footer tagline</Label>
          <Input
            value={form.footer_tagline}
            onChange={(e) => setForm((f) => ({ ...f, footer_tagline: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Facebook URL</Label>
            <Input
              value={form.social_facebook}
              onChange={(e) => setForm((f) => ({ ...f, social_facebook: e.target.value }))}
            />
          </div>
          <div>
            <Label>Instagram URL</Label>
            <Input
              value={form.social_instagram}
              onChange={(e) => setForm((f) => ({ ...f, social_instagram: e.target.value }))}
            />
          </div>
          <div>
            <Label>Twitter / X URL</Label>
            <Input
              value={form.social_twitter}
              onChange={(e) => setForm((f) => ({ ...f, social_twitter: e.target.value }))}
            />
          </div>
        </div>
      </Section>

      <Section title="Design template">
        <TemplatePicker
          value={form.website_template}
          onChange={(website_template) => setForm((f) => ({ ...f, website_template }))}
          primaryColor={form.theme_primary_color}
          secondaryColor={form.theme_secondary_color}
        />
      </Section>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-stone-200 bg-white/95 py-4 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save website"}
        </Button>
        {form.public_site_enabled && (
          <a
            href={`/schools/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline dark:text-primary"
          >
            Preview live site
          </a>
        )}
      </div>
    </form>
  );
}
