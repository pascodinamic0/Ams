"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function InvoiceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/finance/invoices?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <Label htmlFor="status-filter">Status</Label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => updateParams("status", e.target.value)}
          className="mt-1 w-full min-w-[140px] rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <div className="min-w-[200px] flex-1">
        <Label htmlFor="search-filter">Search</Label>
        <Input
          id="search-filter"
          defaultValue={search}
          placeholder="Student name or ID"
          onBlur={(e) => updateParams("search", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParams("search", e.currentTarget.value);
          }}
        />
      </div>
    </div>
  );
}
