import { Suspense } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTeacherClasses, getGradesForClass } from "@/lib/db";
import { getSubjects } from "@/lib/db/subjects";
import { ExamGradeGrid } from "./exam-grade-grid";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; subject?: string; exam?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-slate-500">Please sign in to enter exam grades.</p>;
  }

  const params = await searchParams;
  const [classes, subjects] = await Promise.all([
    getTeacherClasses(profile.id),
    getSubjects(profile.branch_id ?? undefined),
  ]);

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Exams</h1>
        <EmptyState title="No classes assigned" description="Assign classes in the timetable first." />
      </div>
    );
  }

  const classId = params.class && classes.some((c) => c.id === params.class)
    ? params.class
    : classes[0].id;
  const subjectId = params.subject ?? "";
  const examName = params.exam ?? "Midterm Exam";

  const rows = subjectId
    ? await getGradesForClass({ classId, subjectId, term: examName })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exams</h1>
      <p className="text-sm text-slate-500">Enter exam marks and letter grades per subject.</p>
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <ExamGradeGrid
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          subjects={subjects}
          initialClassId={classId}
          initialSubjectId={subjectId}
          initialExamName={examName}
          rows={rows}
        />
      </Suspense>
    </div>
  );
}
