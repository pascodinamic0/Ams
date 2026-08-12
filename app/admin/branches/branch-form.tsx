"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createBranch } from "@/lib/actions/branches";
import { toast } from "@/lib/toast";

interface Props {
  schools: { id: string; name: string }[];
}

export function BranchForm({ schools }: Props) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId) {
      toast.error(te("selectASchool"));
      return;
    }
    setLoading(true);
    const result = await createBranch({
      name,
      school_id: schoolId,
      address: address || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("failedCreateBranch"));
      return;
    }
    toast.success(t("branchCreated"));
    setName("");
    setAddress("");
    router.refresh();
  }

  if (schools.length === 0) {
    return (
      <p className="text-sm text-stone-500">{t("addSchoolFirst")}</p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Label>{tc("name")}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>{t("schoolLabel")}</Label>
        <Select
          options={schools.map((s) => ({ value: s.id, label: s.name }))}
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>{t("address")}</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">
          {t("addBranch")}
        </Button>
      </div>
    </form>
  );
}
