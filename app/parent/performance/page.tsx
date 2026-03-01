import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ParentPerformancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyState
        title="Not signed in"
        description="Please log in to view your children's performance"
      />
    );
  }

  // Find this guardian's students
  const { data: guardian } = await supabase
    .from("guardians")
    .select("id, name")
    .eq("auth_user_id", user.id)
    .single();

  if (!guardian) {
    return (
      <EmptyState
        title="No guardian profile"
        description="Your account is not linked to a guardian profile. Contact the school."
      />
    );
  }

  type StudentLink = {
    students: {
      id: string; first_name: string; last_name: string;
      student_id: string; classes: { name: string } | null;
    } | null;
  };

  const { data: linksRaw } = await supabase
    .from("guardian_students")
    .select("student_id, students(id, first_name, last_name, student_id, classes(name))")
    .eq("guardian_id", guardian.id);

  const links = (linksRaw ?? []) as unknown as StudentLink[];
  const students = links.map((l) => l.students).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your {students.length === 1 ? "child's" : "children's"} daily learning, grades, and attendance patterns.
        </p>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="No students linked"
          description="Contact the school to link your children to your account."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Link
              key={s!.id}
              href={`/parent/performance/${s!.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {s!.first_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {s!.first_name} {s!.last_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(s!.classes as { name: string } | null)?.name ?? "No class"} · {s!.student_id}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>View grades, attendance & daily schedule</span>
                <svg className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
