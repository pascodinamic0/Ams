"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function LibrarySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  function updateSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/operations/library?${params.toString()}`);
  }

  return (
    <div className="min-w-[200px] flex-1">
      <Label htmlFor="library-search">Search books</Label>
      <Input
        id="library-search"
        defaultValue={search}
        placeholder="Title, author, or ISBN"
        onBlur={(e) => updateSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateSearch(e.currentTarget.value);
        }}
      />
    </div>
  );
}
