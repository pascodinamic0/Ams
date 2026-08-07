"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { updateSchoolTeamMemberRole } from "@/lib/actions/invite-user";
import { INVITABLE_ROLES } from "@/lib/validations/team";
import { toast } from "@/lib/toast";

interface TeamRoleSelectProps {
  userId: string;
  currentRole: string;
  disabled?: boolean;
}

export function TeamRoleSelect({
  userId,
  currentRole,
  disabled = false,
}: TeamRoleSelectProps) {
  const t = useTranslations("academic");
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  const roleLabels: Record<string, string> = {
    academic_admin: t("roleAcademicAdmin"),
    admin_coordinator: t("roleAdminCoordinator"),
    registrar: t("roleRegistrar"),
    admissions_officer: t("roleAdmissionsOfficer"),
    pedagogy_coordinator: t("rolePedagogyCoordinator"),
    principal: t("rolePrincipal"),
    teacher: t("roleTeacher"),
    finance_officer: t("roleFinanceOfficer"),
    cashier: t("roleCashier"),
    accountant: t("roleAccountant"),
    operations_manager: t("roleOperationsManager"),
    operations_officer: t("roleOperationsOfficer"),
    discipline_officer: t("roleDisciplineOfficer"),
    supervisor: t("roleSupervisor"),
    pedagogical_council_member: t("rolePedagogicalCouncilMember"),
    analytics: t("roleAnalytics"),
  };

  async function handleChange(nextRole: string) {
    if (nextRole === role) return;

    const previousRole = role;
    setRole(nextRole);
    setLoading(true);

    const result = await updateSchoolTeamMemberRole({
      userId,
      role: nextRole as (typeof INVITABLE_ROLES)[number],
    });

    setLoading(false);

    if (result.error) {
      setRole(previousRole);
      toast.error(result.error);
      return;
    }

    toast.success(t("roleUpdated"));
    router.refresh();
  }

  return (
    <Select
      options={INVITABLE_ROLES.map((r) => ({
        value: r,
        label: roleLabels[r] ?? r,
      }))}
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled || loading}
      className="min-w-[12rem]"
    />
  );
}
