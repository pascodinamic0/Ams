"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClass } from "@/lib/actions/classes";
import { toast } from "@/lib/toast";

export function ClassForm({
  branchId,
  teachers = [],
}: {
  branchId: string;
  teachers?: { id: string; name: string }[];
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [capacity, setCapacity] = useState("");
  const [mainTeacherId, setMainTeacherId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createClass({
      name,
      branch_id: branchId,
      grade: grade || undefined,
      capacity: capacity ? Number(capacity) : undefined,
      main_teacher_id: mainTeacherId || null,
    });
    setLoading(false);
    if ("error" in result && result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("classCreateFailed"));
      return;
    }
    toast.success(t("classCreated"));
    setName("");
    setGrade("");
    setCapacity("");
    setMainTeacherId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div><Label>{tc("name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div><Label>{t("grade")}</Label><Input value={grade} onChange={(e) => setGrade(e.target.value)} /></div>
      <div><Label>{t("capacity")}</Label><Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
      <div>
        <Label>{t("mainTeacher")}</Label>
        <Select
          value={mainTeacherId}
          onChange={(e) => setMainTeacherId(e.target.value)}
          options={[
            { value: "", label: t("selectMainTeacher") },
            ...teachers.map((teacher) => ({ value: teacher.id, label: teacher.name })),
          ]}
        />
      </div>
      <div className="flex items-end"><Button type="submit" disabled={loading} className="w-full">{t("addClass")}</Button></div>
    </form>
  );
}
