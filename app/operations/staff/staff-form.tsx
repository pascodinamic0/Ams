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
  const [department, setDepartment] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("0");
  const [employmentStatus, setEmploymentStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createStaff({
      name,
      email: email || undefined,
      role: role || undefined,
      department: department || undefined,
      monthly_salary: Number(monthlySalary || 0),
      employment_status: employmentStatus,
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
    setDepartment("");
    setMonthlySalary("0");
    setEmploymentStatus("active");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-6">
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
      <div>
        <Label>Department</Label>
        <Input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Academics"
        />
      </div>
      <div>
        <Label>Monthly Salary</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={monthlySalary}
          onChange={(e) => setMonthlySalary(e.target.value)}
        />
      </div>
      <div>
        <Label>Employment Status</Label>
        <select
          value={employmentStatus}
          onChange={(e) => setEmploymentStatus(e.target.value as "active" | "inactive")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
  member: {
    id: string;
    name: string;
    email: string | null;
    role: string | null;
    department: string | null;
    monthly_salary: number;
    employment_status: "active" | "inactive";
  };
  schoolId: string;
  campusId?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email ?? "");
  const [role, setRole] = useState(member.role ?? "");
  const [department, setDepartment] = useState(member.department ?? "");
  const [monthlySalary, setMonthlySalary] = useState(String(member.monthly_salary));
  const [employmentStatus, setEmploymentStatus] = useState<"active" | "inactive">(
    member.employment_status
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const result = await updateStaff(member.id, {
      name,
      email: email || undefined,
      role: role || undefined,
      department: department || undefined,
      monthly_salary: Number(monthlySalary || 0),
      employment_status: employmentStatus,
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
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
      <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" />
      <Input
        type="number"
        min="0"
        step="0.01"
        value={monthlySalary}
        onChange={(e) => setMonthlySalary(e.target.value)}
        placeholder="Monthly salary"
      />
      <select
        value={employmentStatus}
        onChange={(e) => setEmploymentStatus(e.target.value as "active" | "inactive")}
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading}>Save</Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}
