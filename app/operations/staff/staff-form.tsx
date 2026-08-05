"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaff, updateStaff, deleteStaff } from "@/lib/actions/staff";
import { toast } from "@/lib/toast";

interface StaffFormProps {
  schoolId: string;
  campusId?: string;
}

export function StaffForm({ schoolId, campusId }: StaffFormProps) {
  const t = useTranslations("operations");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("0");
  const [employmentStatus, setEmploymentStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createStaff({
      name,
      email: email || undefined,
      role: role || undefined,
      monthly_salary: Number(monthlySalary || 0),
      employment_status: employmentStatus,
      school_id: schoolId,
      branch_id: campusId ?? null,
    });
    setLoading(false);
    if (result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : Object.values(result.error).flat().join(", ") || t("staffAddFailed");
      toast.error(message);
      return;
    }
    toast.success(t("staffAdded"));
    setName("");
    setEmail("");
    setRole("");
    setMonthlySalary("0");
    setEmploymentStatus("active");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <Label>{tc("name")}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>{tc("email")}</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label>{t("colRole")}</Label>
        <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={t("rolePlaceholder")} />
      </div>
      <div>
        <Label>{t("monthlySalary")}</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={monthlySalary}
          onChange={(e) => setMonthlySalary(e.target.value)}
        />
      </div>
      <div>
        <Label>{t("employmentStatus")}</Label>
        <select
          value={employmentStatus}
          onChange={(e) => setEmploymentStatus(e.target.value as "active" | "inactive")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="active">{tc("active")}</option>
          <option value="inactive">{tc("inactive")}</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">{t("addStaff")}</Button>
      </div>
    </form>
  );
}

export function EditStaffButton({
  member,
  schoolId,
  campusId,
}: {
  member: {
    id: string;
    name: string;
    email: string | null;
    role: string | null;
    monthly_salary: number;
    employment_status: "active" | "inactive";
  };
  schoolId: string;
  campusId?: string;
}) {
  const t = useTranslations("operations");
  const tc = useTranslations("common");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email ?? "");
  const [role, setRole] = useState(member.role ?? "");
  const [monthlySalary, setMonthlySalary] = useState(String(member.monthly_salary));
  const [employmentStatus, setEmploymentStatus] = useState<"active" | "inactive">(
    member.employment_status
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const result = await updateStaff(member.id, {
      name,
      email: email || undefined,
      role: role || undefined,
      monthly_salary: Number(monthlySalary || 0),
      employment_status: employmentStatus,
      school_id: schoolId,
      branch_id: campusId ?? null,
    });
    setLoading(false);
    if (result.error) {
      toast.error(t("staffUpdateFailed"));
      return;
    }
    toast.success(t("staffUpdated"));
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(t("confirmDeleteStaff"))) return;
    setLoading(true);
    const result = await deleteStaff(member.id);
    setLoading(false);
    if (result.error) {
      toast.error(t("staffDeleteFailed"));
      return;
    }
    toast.success(t("staffDeleted"));
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>{tc("edit")}</Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}>{tc("delete")}</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tc("email")} />
      <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={t("colRole")} />
      <Input
        type="number"
        min="0"
        step="0.01"
        value={monthlySalary}
        onChange={(e) => setMonthlySalary(e.target.value)}
        placeholder={t("monthlySalary")}
      />
      <select
        value={employmentStatus}
        onChange={(e) => setEmploymentStatus(e.target.value as "active" | "inactive")}
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
      >
        <option value="active">{tc("active")}</option>
        <option value="inactive">{tc("inactive")}</option>
      </select>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading}>{tc("save")}</Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{tc("cancel")}</Button>
      </div>
    </div>
  );
}
