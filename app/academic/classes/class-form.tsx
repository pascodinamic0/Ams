"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClass } from "@/lib/actions/classes";
import { toast } from "@/lib/toast";

interface Props {
  branchId: string;
  sections: { id: string; name: string }[];
}

export function ClassForm({ branchId, sections }: Props) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createClass({
      name,
      branch_id: branchId,
      grade: grade || undefined,
      section_id: sectionId || undefined,
      capacity: capacity ? Number(capacity) : undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("classCreateFailed"));
      return;
    }
    toast.success(t("classCreated"));
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div><Label>{tc("name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div><Label>{t("grade")}</Label><Input value={grade} onChange={(e) => setGrade(e.target.value)} /></div>
      <div>
        <Label>{t("sectionsTitle")}</Label>
        <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900">
          <option value="">{t("none")}</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div><Label>{t("capacity")}</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
      <div className="flex items-end"><Button type="submit" disabled={loading} className="w-full">{t("addClass")}</Button></div>
    </form>
  );
}
