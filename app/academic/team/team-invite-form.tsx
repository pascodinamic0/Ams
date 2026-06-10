"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { inviteSchoolUser } from "@/lib/actions/invite-user";
import { INVITABLE_ROLES } from "@/lib/validations/team";
import { toast } from "@/lib/toast";

const ROLE_LABELS: Record<string, string> = {
  academic_admin: "Academic admin",
  teacher: "Teacher",
  finance_officer: "Finance officer",
  operations_manager: "Operations manager",
  analytics: "Analytics",
};

export function TeamInviteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("teacher");
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTempPassword(null);

    const result = await inviteSchoolUser({
      name,
      email,
      role: role as (typeof INVITABLE_ROLES)[number],
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.data?.existing) {
      toast.success("Existing user linked to your school with the new role");
    } else if (result.data?.tempPassword) {
      setTempPassword(result.data.tempPassword);
      toast.success("Team member created. Share the temporary password below.");
    } else {
      toast.success("Team member invited");
    }

    setName("");
    setEmail("");
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 dark:border-slate-800">
      <h2 className="font-semibold text-slate-900 dark:text-white">Invite team member</h2>
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@school.com"
            required
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select
            options={INVITABLE_ROLES.map((r) => ({
              value: r,
              label: ROLE_LABELS[r] ?? r,
            }))}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Inviting..." : "Invite"}
          </Button>
        </div>
      </form>

      {tempPassword && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Temporary password (share securely, shown once):
          </p>
          <code className="mt-2 block font-mono text-base">{tempPassword}</code>
          <p className="mt-2 text-amber-800 dark:text-amber-300">
            They can sign in at /login and change their password in Settings.
          </p>
        </div>
      )}
    </div>
  );
}
