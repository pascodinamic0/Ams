import { redirect } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getSchoolTeamMembers } from "@/lib/db/users";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { TeamInviteForm } from "./team-invite-form";

export default async function AcademicTeamPage() {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/academic");

  const supabase = await createClient();
  const { data: school } = await supabase
    .from("schools")
    .select("status, name")
    .eq("id", profile.school_id)
    .single();

  if (school?.status !== "approved") {
    redirect("/pending");
  }

  const members = await getSchoolTeamMembers(profile.school_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("teamTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("teamDescription", { school: school?.name ?? t("yourSchool") })}
        </p>
      </div>

      <TeamInviteForm />

      {members.length === 0 ? (
        <EmptyState
          title={t("noTeamYet")}
          description={t("inviteFirstTeam")}
        />
      ) : (
        <DataTable
          data={members.map((m) => ({
            ...m,
            role_label: m.role.replace(/_/g, " "),
          }))}
          columns={[
            { id: "name", header: tc("name"), accessorKey: "name", sortable: true },
            { id: "email", header: tc("email"), accessorKey: "email", sortable: true },
            { id: "role", header: t("role"), accessorKey: "role_label" },
          ]}
        />
      )}
    </div>
  );
}
