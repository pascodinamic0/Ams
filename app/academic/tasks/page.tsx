import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/rbac";
import { getSchoolTasks } from "@/lib/db/workspaces";
import { getSchoolTeamMembers } from "@/lib/db/users";
import { getStudents } from "@/lib/db";
import { TaskBoard } from "./task-board";

export default async function AcademicTasksPage() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/academic");
  if (!canAccessPath(profile.role, "/academic/tasks")) redirect("/academic");

  const [tasks, staff, students] = await Promise.all([
    getSchoolTasks(profile.school_id),
    getSchoolTeamMembers(profile.school_id),
    getStudents({ schoolId: profile.school_id }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("taskBoardTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {t("taskBoardSubtitle")}
        </p>
      </div>
      <TaskBoard
        tasks={tasks ?? []}
        staff={(staff ?? []).map((member) => ({
          id: member.id,
          name: member.name?.trim() || member.email || t("staffMemberFallback"),
          role: member.role,
        }))}
        students={(students ?? []).map((student) => ({
          id: student.id,
          name: student.class_name
            ? `${student.name} · ${student.class_name}`
            : student.name,
        }))}
      />
    </div>
  );
}
