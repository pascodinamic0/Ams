import { redirect } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getSchoolTeamMembers } from "@/lib/db/users";
import { createClient } from "@/lib/supabase/server";
import { TeamInviteForm } from "./team-invite-form";

export default async function AcademicTeamPage() {
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
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Invite teachers, finance officers, and other staff to {school?.name ?? "your school"}.
          Each person gets their own role-based dashboard.
        </p>
      </div>

      <TeamInviteForm />

      {members.length === 0 ? (
        <EmptyState
          title="No team members yet"
          description="Invite your first teacher or staff member above"
        />
      ) : (
        <DataTable
          data={members.map((m) => ({
            ...m,
            role_label: m.role.replace(/_/g, " "),
          }))}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "email", header: "Email", accessorKey: "email", sortable: true },
            { id: "role", header: "Role", accessorKey: "role_label" },
          ]}
        />
      )}
    </div>
  );
}
