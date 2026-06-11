"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toggleSchoolFeature } from "@/lib/actions/features";
import { toast } from "@/lib/toast";
import type { SchoolFeatureRow } from "@/lib/db";

type Props = {
  schools: SchoolFeatureRow[];
  isSuperAdmin: boolean;
  defaultSchoolId?: string | null;
};

export function FeatureToggleGrid({ schools, isSuperAdmin, defaultSchoolId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedSchoolId = useMemo(() => {
    const paramSchoolId = searchParams.get("school");
    if (paramSchoolId && schools.some((s) => s.school_id === paramSchoolId)) {
      return paramSchoolId;
    }
    if (
      !isSuperAdmin &&
      defaultSchoolId &&
      schools.some((s) => s.school_id === defaultSchoolId)
    ) {
      return defaultSchoolId;
    }
    return schools[0]?.school_id ?? "";
  }, [searchParams, schools, isSuperAdmin, defaultSchoolId]);

  const selectedSchool = schools.find((s) => s.school_id === selectedSchoolId);

  function handleSchoolChange(schoolId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (schoolId) {
      params.set("school", schoolId);
    } else {
      params.delete("school");
    }
    const query = params.toString();
    router.push(query ? `/admin/features?${query}` : "/admin/features");
  }

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
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
        <p className="text-sm text-slate-500">No schools configured yet.</p>
        {isSuperAdmin ? (
          <Link href="/admin/schools/new" className="mt-3 inline-block">
            <Button size="sm">Add school</Button>
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSuperAdmin ? (
        <div className="max-w-md space-y-2">
          <Label htmlFor="feature-school-select">School</Label>
          <Select
            id="feature-school-select"
            options={schools.map((s) => ({ value: s.school_id, label: s.school_name }))}
            value={selectedSchoolId}
            onChange={(e) => handleSchoolChange(e.target.value)}
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select which school&apos;s modules to enable or disable.
          </p>
        </div>
      ) : selectedSchool ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Managing features for{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {selectedSchool.school_name}
          </span>
        </p>
      ) : null}

      {selectedSchool ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {isSuperAdmin ? (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedSchool.school_name}
            </h2>
          ) : null}
          <div
            className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${isSuperAdmin ? "mt-4" : ""}`}
          >
            {selectedSchool.features.map((feature) => (
              <label
                key={feature.key}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <Checkbox
                  checked={feature.enabled}
                  onChange={(e) =>
                    handleToggle(selectedSchool.school_id, feature.key, e.target.checked)
                  }
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900 dark:text-white">
                    {feature.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {feature.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Select a school to manage its features.</p>
      )}
    </div>
  );
}
