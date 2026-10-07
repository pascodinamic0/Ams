"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { updateSchoolTeamMemberRole } from "@/lib/actions/invite-user";
import { ASSIGNABLE_ROLES } from "@/lib/validations/team";
import { toast } from "@/lib/toast";

interface TeamRoleSelectProps {
  userId: string;
  currentRole: string;
  disabled?: boolean;
  /** Role cannot be changed (e.g. last academic admin, platform super admin). */
  locked?: boolean;
}

export function TeamRoleSelect({
  userId,
  currentRole,
  disabled = false,
  locked = false,
}: TeamRoleSelectProps) {
  const t = useTranslations("academic");
  const tRoles = useTranslations("roles");
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  function roleLabel(value: string) {
    return tRoles.has(value) ? tRoles(value) : value.replace(/_/g, " ");
  }

  const label = roleLabel(currentRole);

  if (locked || currentRole === "super_admin") {
    const lockTitle =
      currentRole === "super_admin"
        ? t("roleLockedSuperAdmin")
        : t("roleLockedAcademicAdmin");

    return (
      <span
        className="inline-flex min-w-[12rem] items-center rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
        title={lockTitle}
      >
        {label}
      </span>
    );
  }

  async function handleChange(nextRole: string) {
    if (nextRole === role) return;

    const previousRole = role;
    setRole(nextRole);
    setLoading(true);

    const result = await updateSchoolTeamMemberRole({
      userId,
      role: nextRole as (typeof ASSIGNABLE_ROLES)[number],
    });

    setLoading(false);

    if ("error" in result && result.error) {
      setRole(previousRole);
      toast.error(result.error);
      return;
    }

    toast.success(t("roleUpdated"));
    router.refresh();
  }

  return (
    <Select
      options={ASSIGNABLE_ROLES.map((r) => ({
        value: r,
        label: roleLabel(r),
      }))}
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled || loading}
      className="min-w-[12rem]"
    />
  );
}
