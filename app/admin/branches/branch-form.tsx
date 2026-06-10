"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createBranch } from "@/lib/actions/branches";
import { toast } from "@/lib/toast";

interface Props {
  schools: { id: string; name: string }[];
}

export function BranchForm({ schools }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId) {
      toast.error("Select a school");
      return;
    }
    setLoading(true);
    const result = await createBranch({
      name,
      school_id: schoolId,
      address: address || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to create branch");
      return;
    }
    toast.success("Branch created");
    setName("");
    setAddress("");
    router.refresh();
  }

  if (schools.length === 0) {
    return (
      <p className="text-sm text-zinc-500">Add a school before creating branches.</p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>School</Label>
        <Select
          options={schools.map((s) => ({ value: s.id, label: s.name }))}
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">
          Add branch
        </Button>
      </div>
    </form>
  );
}
