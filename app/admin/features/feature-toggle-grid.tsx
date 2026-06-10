"use client";

import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleSchoolFeature } from "@/lib/actions/features";
import { toast } from "@/lib/toast";
import type { SchoolFeatureRow } from "@/lib/db";

export function FeatureToggleGrid({ schools }: { schools: SchoolFeatureRow[] }) {
  const router = useRouter();

  async function handleToggle(schoolId: string, featureKey: string, enabled: boolean) {
    const result = await toggleSchoolFeature(schoolId, featureKey, enabled);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(enabled ? "Feature enabled" : "Feature disabled");
    router.refresh();
  }

  if (schools.length === 0) {
    return <p className="text-sm text-slate-500">No schools configured yet.</p>;
  }

  return (
    <div className="space-y-6">
      {schools.map((school) => (
        <div
          key={school.school_id}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white">{school.school_name}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {school.features.map((feature) => (
              <label
                key={feature.key}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <Checkbox
                  checked={feature.enabled}
                  onChange={(e) =>
                    handleToggle(school.school_id, feature.key, e.target.checked)
                  }
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900 dark:text-white">
                    {feature.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">{feature.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
