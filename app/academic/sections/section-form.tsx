"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSection } from "@/lib/actions/sections";
import { toast } from "@/lib/toast";

export function SectionForm({ branchId }: { branchId: string }) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createSection({ name, branch_id: branchId });
    setLoading(false);
    if (result.error) {
      toast.error(t("sectionCreateFailed"));
      return;
    }
    toast.success(t("sectionCreated"));
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1"><Label>{tc("name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div className="flex items-end"><Button type="submit" disabled={loading}>{t("addSection")}</Button></div>
    </form>
  );
}
