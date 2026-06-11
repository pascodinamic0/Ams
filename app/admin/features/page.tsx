import { Suspense } from "react";
import { getSchoolFeatureMatrix } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { FeatureToggleGrid } from "./feature-toggle-grid";

export default async function FeaturesPage() {
  const [schools, profile] = await Promise.all([
    getSchoolFeatureMatrix(),
    getCurrentProfile(),
  ]);

  const isSuperAdmin = profile?.role === "super_admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feature Toggles</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {isSuperAdmin
            ? "Choose a school, then enable or disable modules for that school."
            : "Enable or disable modules for your school."}
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading features…</p>
        }
      >
        <FeatureToggleGrid
          schools={schools}
          isSuperAdmin={isSuperAdmin}
          defaultSchoolId={profile?.school_id}
        />
      </Suspense>
    </div>
  );
}
