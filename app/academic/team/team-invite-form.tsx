"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { inviteSchoolUser } from "@/lib/actions/invite-user";
import { INVITABLE_ROLES } from "@/lib/validations/team";
import { toast } from "@/lib/toast";

export function TeamInviteForm() {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("teacher");
  const [loading, setLoading] = useState(false);

  const roleLabels: Record<string, string> = {
    academic_admin: t("roleAcademicAdmin"),
    teacher: t("roleTeacher"),
    finance_officer: t("roleFinanceOfficer"),
    operations_manager: t("roleOperationsManager"),
    analytics: t("roleAnalytics"),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await inviteSchoolUser({
      name,
      email,
      role: role as (typeof INVITABLE_ROLES)[number],
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

  return (
    <div className="space-y-4 rounded-lg border p-4 dark:border-stone-800">
      <h2 className="font-semibold text-stone-900 dark:text-white">{t("inviteTeamMember")}</h2>
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <Label>{tc("name")}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            required
          />
        </div>
        <div>
          <Label>{tc("email")}</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
          />
        </div>
        <div>
          <Label>{t("role")}</Label>
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("inviting") : t("invite")}
          </Button>
        </div>
      </form>
    </div>
  );
}
