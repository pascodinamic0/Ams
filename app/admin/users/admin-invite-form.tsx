"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { inviteSchoolUser } from "@/lib/actions/invite-user";
import { INVITABLE_ROLES } from "@/lib/validations/team";
import { toast } from "@/lib/toast";

type SchoolOption = { id: string; name: string };
type CampusOption = { id: string; name: string; school_id: string };

export function AdminInviteForm({
  schools,
  campuses,
}: {
  schools: SchoolOption[];
  campuses: CampusOption[];
}) {
  const t = useTranslations("admin");
  const ta = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("teacher");
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  const campusForSchool = useMemo(
    () => campuses.find((c) => c.school_id === schoolId) ?? null,
    [campuses, schoolId]
  );

  const roleLabels: Record<string, string> = {
    academic_admin: ta("roleAcademicAdmin"),
    admin_coordinator: ta("roleAdminCoordinator"),
    registrar: ta("roleRegistrar"),
    admissions_officer: ta("roleAdmissionsOfficer"),
    pedagogy_coordinator: ta("rolePedagogyCoordinator"),
    principal: ta("rolePrincipal"),
    teacher: ta("roleTeacher"),
    finance_officer: ta("roleFinanceOfficer"),
    cashier: ta("roleCashier"),
    accountant: ta("roleAccountant"),
    operations_manager: ta("roleOperationsManager"),
    operations_officer: ta("roleOperationsOfficer"),
    discipline_officer: ta("roleDisciplineOfficer"),
    supervisor: ta("roleSupervisor"),
    pedagogical_council_member: ta("rolePedagogicalCouncilMember"),
    analytics: ta("roleAnalytics"),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId || !campusForSchool) {
      toast.error(t("inviteNeedCampus"));
      return;
    }

    setLoading(true);
    const result = await inviteSchoolUser({
      name,
      email,
      role: role as (typeof INVITABLE_ROLES)[number],
      schoolId,
      branchId: campusForSchool.id,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("invitationSent"));
    setName("");
    setEmail("");
    router.refresh();
  }

  if (schools.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-stone-500 dark:border-stone-700">
        {t("inviteNoSchools")}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 dark:border-stone-800">
      <div>
        <h2 className="font-semibold text-stone-900 dark:text-white">
          {t("inviteUserTitle")}
        </h2>
        <p className="mt-1 text-sm text-stone-500">{t("inviteUserDesc")}</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <div>
          <Label>{t("inviteSchoolLabel")}</Label>
          <Select
            options={schools.map((s) => ({ value: s.id, label: s.name }))}
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
          />
        </div>
        <div>
          <Label>{t("inviteCampusLabel")}</Label>
          <Input
            value={campusForSchool?.name ?? t("inviteNoCampusForSchool")}
            disabled
          />
        </div>
        <div>
          <Label>{tc("name")}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>{tc("email")}</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>{ta("role")}</Label>
          <Select
            options={INVITABLE_ROLES.map((r) => ({
              value: r,
              label: roleLabels[r] ?? r,
            }))}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            disabled={loading || !campusForSchool}
            className="w-full"
          >
            {loading ? ta("inviting") : ta("invite")}
          </Button>
        </div>
      </form>
    </div>
  );
}
