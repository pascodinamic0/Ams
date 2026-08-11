import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath, normalizeRole } from "@/lib/auth/rbac";
import { getStudents } from "@/lib/db";
import { getDisciplineIncidents } from "@/lib/db/workspaces";
import { DisciplineBoard } from "./discipline-board";
import { formatPersonName } from "@/lib/utils";

export default async function AcademicDisciplinePage() {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/academic");
  if (normalizeRole(profile.role) === "teacher") redirect("/teacher/discipline");
  if (!canAccessPath(profile.role, "/academic/discipline")) redirect("/academic");

  const [incidents, students] = await Promise.all([
    getDisciplineIncidents(profile.school_id),
    getStudents({ schoolId: profile.school_id }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Discipline desk</h1>
        <p className="mt-1 text-sm text-stone-500">
          Log incidents, track open cases, and escalate what needs leadership attention.
        </p>
      </div>
      <DisciplineBoard
        incidents={incidents}
        students={students.map((student) => ({
          id: student.id,
          name: formatPersonName(student),
        }))}
      />
    </div>
  );
}
