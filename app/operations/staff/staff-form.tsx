"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaff, updateStaff, deleteStaff } from "@/lib/actions/staff";
import { toast } from "@/lib/toast";

interface StaffFormProps {
  schoolId: string;
  campusId?: string;
}

export function StaffForm({ schoolId, campusId }: StaffFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createStaff({
      name,
      email: email || undefined,
      role: role || undefined,
      school_id: schoolId,
      branch_id: campusId ?? null,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to add staff member");
      return;
    }
    toast.success("Staff member added");
    setName("");
    setEmail("");
    setRole("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label>Role</Label>
        <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Librarian" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">Add staff</Button>
      </div>
    </form>
  );
}

export function EditStaffButton({
  member,
  schoolId,
  campusId,
}: {
  member: { id: string; name: string; email: string | null; role: string | null };
  schoolId: string;
  campusId?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email ?? "");
  const [role, setRole] = useState(member.role ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const result = await updateStaff(member.id, {
      name,
      email: email || undefined,
      role: role || undefined,
      school_id: schoolId,
      branch_id: campusId ?? null,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to update staff member");
      return;
    }
    toast.success("Staff updated");
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this staff member?")) return;
    setLoading(true);
    const result = await deleteStaff(member.id);
    setLoading(false);
    if (result.error) {
      toast.error("Failed to delete staff member");
      return;
    }
    toast.success("Staff deleted");
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}>Delete</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading}>Save</Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}
