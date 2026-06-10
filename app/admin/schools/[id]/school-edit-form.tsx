"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    website_template: (school.website_template ?? "modern") as "modern" | "classic" | "minimal",
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
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border p-6">
      <div>
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label>Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label>Contact email</Label>
        <Input
          type="email"
          value={form.contact_email}
          onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
        />
      </div>
      <div>
        <Label>Contact phone</Label>
        <Input
          value={form.contact_phone}
          onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
        />
      </div>
      <div>
        <Label>Address</Label>
        <Input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>
      <div>
        <Label>Custom domain</Label>
        <Input
          value={form.custom_domain}
          onChange={(e) => setForm((f) => ({ ...f, custom_domain: e.target.value }))}
          placeholder="www.school.edu"
        />
      </div>
      <div>
        <Label>Website template</Label>
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
              website_template: e.target.value as "modern" | "classic" | "minimal",
            }))
          }
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="public_site_enabled"
          type="checkbox"
          checked={form.public_site_enabled}
          onChange={(e) =>
            setForm((f) => ({ ...f, public_site_enabled: e.target.checked }))
          }
          className="h-4 w-4 rounded border-zinc-300"
        />
        <Label htmlFor="public_site_enabled">Public site enabled</Label>
      </div>
      <Button type="submit" disabled={loading}>
        Save changes
      </Button>
    </form>
  );
}
