import { getSchoolFeatureMatrix } from "@/lib/db";
import { FeatureToggleGrid } from "./feature-toggle-grid";

export default async function FeaturesPage() {
  const schools = await getSchoolFeatureMatrix();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feature Toggles</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Enable or disable modules per school
        </p>
      </div>

      <FeatureToggleGrid schools={schools} />
    </div>
  );
}
