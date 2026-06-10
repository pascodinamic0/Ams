import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getCurriculum, getSubjects } from "@/lib/db";
import { CurriculumForm } from "./curriculum-form";
import { CurriculumTable } from "./curriculum-table";

export default async function CurriculumPage() {
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";

  if (!branchId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Curriculum</h1>
        <EmptyState
          title="Branch required"
          description="Assign a branch to your profile to manage curriculum entries."
        />
      </div>
    );
  }

  const [curriculum, subjects] = await Promise.all([
    getCurriculum(branchId),
    getSubjects(branchId),
  ]);

  const subjectOptions = subjects.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Curriculum</h1>
        <p className="mt-1 text-sm text-slate-500">
          Map subjects to grades and track syllabus content per branch.
        </p>
      </div>

      <CurriculumForm branchId={branchId} subjects={subjectOptions} />

      {subjects.length === 0 && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Add subjects under Academic → Subjects before creating curriculum entries.
        </p>
      )}

      {curriculum.length === 0 ? (
        <EmptyState
          title="No curriculum entries yet"
          description="Add grade–subject mappings and optional syllabus notes."
        />
      ) : (
        <CurriculumTable
          curriculum={curriculum}
          branchId={branchId}
          subjects={subjectOptions}
        />
      )}
    </div>
  );
}
