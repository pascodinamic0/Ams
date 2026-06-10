"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSection } from "@/lib/actions/sections";
import { toast } from "@/lib/toast";

export function SectionForm({ branchId }: { branchId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createSection({ name, branch_id: branchId });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to create section");
      return;
    }
    toast.success("Section created");
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div className="flex items-end"><Button type="submit" disabled={loading}>Add section</Button></div>
    </form>
  );
}
