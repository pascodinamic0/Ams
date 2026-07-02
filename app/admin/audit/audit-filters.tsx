"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AuditFilters({ entityTypes }: { entityTypes: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entityType = searchParams.get("entityType") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  function applyFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/admin/audit?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <Label htmlFor="entity-type">Entity type</Label>
        <select
          id="entity-type"
          value={entityType}
          onChange={(e) => applyFilters({ entityType: e.target.value })}
          className="mt-1 w-full min-w-[160px] rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">All entities</option>
          {entityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="start-date">From</Label>
        <Input
          id="start-date"
          type="date"
          defaultValue={startDate}
          className="mt-1"
          onBlur={(e) => applyFilters({ startDate: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="end-date">To</Label>
        <Input
          id="end-date"
          type="date"
          defaultValue={endDate}
          className="mt-1"
          onBlur={(e) => applyFilters({ endDate: e.target.value })}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/admin/audit")}
      >
        Clear filters
      </Button>
    </div>
  );
}
