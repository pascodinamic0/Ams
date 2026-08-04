import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/rbac";
import { getSchoolTasks } from "@/lib/db/workspaces";
import { TaskBoard } from "./task-board";

export default async function AcademicTasksPage() {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/academic");
  if (!canAccessPath(profile.role, "/academic/tasks")) redirect("/academic");

  const tasks = await getSchoolTasks(profile.school_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Task board</h1>
        <p className="mt-1 text-sm text-stone-500">
          Track unfinished school work, assign follow-ups, and clear blockers.
        </p>
      </div>
      <TaskBoard tasks={tasks} />
    </div>
  );
}
