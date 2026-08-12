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
  const [employmentStatus, setEmploymentStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createStaff({
      name,
      email: email || undefined,
      role: role || undefined,
      monthly_salary: 0,
      employment_status: employmentStatus,
      school_id: schoolId,
      branch_id: campusId ?? null,
    });
    setLoading(false);
    if (result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : Object.values(result.error).flat().join(", ") || t("staffCreateFailed");
      toast.error(message);
      return;
    }
    toast.success(t("staffAddedPayrollHint"));
    setName("");
    setEmail("");
    setRole("");
    setEmploymentStatus("active");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <p className="sm:col-span-2 lg:col-span-4 text-xs text-stone-500">
        {t("payAmountsSetByFinance")}
      </p>
      <div className="flex items-end sm:col-span-2 lg:col-span-4">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">{t("addStaff")}</Button>
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
    is_admin_payee?: boolean;
  };
  schoolId: string;
  campusId?: string;
}) {
  const t = useTranslations("operations");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email ?? "");
  const [role, setRole] = useState(member.role ?? "");
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
      monthly_salary: Number(member.monthly_salary || 0),
      employment_status: employmentStatus,
      school_id: schoolId,
      branch_id: campusId ?? null,
    });
    setLoading(false);
    if (result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("staffUpdateFailed")
      );
      return;
    }
    toast.success(t("staffUpdated"));
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (member.is_admin_payee) {
      toast.error(te("staffPayrollManagedInFinance"));
      return;
    }
    if (!confirm(t("deleteStaffConfirm"))) return;
    setLoading(true);
    const result = await deleteStaff(member.id);
    setLoading(false);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : te("failedDeleteStaff"));
      return;
    }
    toast.success(t("staffDeleted"));
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>{tc("edit")}</Button>
        {!member.is_admin_payee ? (
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}>
            {tc("delete")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tc("email")} />
      <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={t("colRole")} />
      <select
        value={employmentStatus}
        onChange={(e) => setEmploymentStatus(e.target.value as "active" | "inactive")}
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
      >
        <option value="active">{tc("active")}</option>
        <option value="inactive">{tc("inactive")}</option>
      </select>
      <p className="sm:col-span-2 lg:col-span-4 text-[11px] text-stone-500">
        {t("payAmountSetByFinanceOnly", { amount: member.monthly_salary.toLocaleString() })}
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading}>{tc("save")}</Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{tc("cancel")}</Button>
      </div>
    </div>
  );
}
