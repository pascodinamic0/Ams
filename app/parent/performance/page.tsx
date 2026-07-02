import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

export default async function ParentPerformancePage() {
  const t = await getTranslations("parent");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyState
        title={t("notSignedIn")}
        description={t("notSignedInDescPerformance")}
      />
    );
  }

  const { data: guardian } = await supabase
    .from("guardians")
    .select("id, name")
    .eq("auth_user_id", user.id)
    .single();

  if (!guardian) {
    return (
      <EmptyState
        title={t("noGuardianProfile")}
        description={t("noGuardianProfileDesc")}
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
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("performanceTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {t("performanceSubtitle", { count: students.length })}
        </p>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title={t("noStudentsLinked")}
          description={t("noStudentsLinkedDesc")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Link
              key={s!.id}
              href={`/parent/performance/${s!.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:border-primary-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-900 dark:hover:border-primary-700"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-lg font-bold text-primary-hover dark:bg-primary-light/50 dark:text-primary">
                  {s!.first_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-stone-900 dark:text-white">
                    {s!.first_name} {s!.last_name}
                  </p>
                  <p className="text-xs text-stone-500">
                    {(s!.classes as { name: string } | null)?.name ?? t("noClass")} · {s!.student_id}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>{t("viewGradesAttendance")}</span>
                <svg className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
