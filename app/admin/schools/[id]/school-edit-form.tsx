"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateSchool } from "@/lib/actions/schools";
import type { SchoolRow } from "@/lib/db/schools";
import { toast } from "@/lib/toast";

export function SchoolEditForm({ school }: { school: SchoolRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: school.name,
    slug: school.slug,
    contact_email: school.contact_email ?? "",
    contact_phone: school.contact_phone ?? "",
    address: school.address ?? "",
    custom_domain: school.custom_domain ?? "",
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
      name: form.name,
      slug: form.slug,
      contact_email: form.contact_email || undefined,
      contact_phone: form.contact_phone || undefined,
      address: form.address || undefined,
      custom_domain: form.custom_domain || undefined,
      website_template: form.website_template,
      public_site_enabled: form.public_site_enabled,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("School updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>School identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">School name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                  /schools/
                </span>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="pl-[5.5rem]"
                  required
                />
              </div>
              <p className="text-xs text-stone-500">
                Used in the public site URL
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact email</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="admin@school.edu"
                value={form.contact_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact_email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact phone</Label>
              <Input
                id="contact_phone"
                placeholder="+1 (555) 000-0000"
                value={form.contact_phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact_phone: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Education Lane"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Public website</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="custom_domain">Custom domain</Label>
              <Input
                id="custom_domain"
                value={form.custom_domain}
                onChange={(e) =>
                  setForm((f) => ({ ...f, custom_domain: e.target.value }))
                }
                placeholder="www.school.edu"
              />
              <p className="text-xs text-stone-500">
                Optional — connect your own domain
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_template">Website template</Label>
              <Select
                options={[
                  { value: "modern", label: "Modern" },
                  { value: "classic", label: "Classic" },
                  { value: "minimal", label: "Minimal" },
                ]}
                value={form.website_template}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    website_template: e.target.value as
                      | "modern"
                      | "classic"
                      | "minimal",
                  }))
                }
              />
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900/50">
            <Checkbox
              id="public_site_enabled"
              checked={form.public_site_enabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, public_site_enabled: e.target.checked }))
              }
              label="Public site enabled"
            />
            <p className="mt-2 pl-6 text-xs text-stone-500">
              When disabled, the school website is hidden from visitors
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
