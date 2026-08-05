"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { deleteUserAccount, updateUserRole } from "@/lib/actions/admin-users";
import { INVITABLE_ROLES } from "@/lib/validations/team";
import { toast } from "@/lib/toast";

const ROLE_OPTIONS = [
  ...INVITABLE_ROLES.map((role) => ({
    value: role,
    label: role.replace(/_/g, " "),
  })),
  { value: "parent", label: "parent" },
  { value: "student", label: "student" },
  { value: "super_admin", label: "super admin" },
];

export function UserActions({
  userId,
  currentRole,
  userName,
}: {
  userId: string;
  currentRole: string;
  userName: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [pending, startTransition] = useTransition();

  function saveRole() {
    if (role === currentRole) return;
    startTransition(async () => {
      const result = await updateUserRole({ userId, role });
      if (result.error) {
        toast.error(result.error);
        setRole(currentRole);
        return;
      }
      toast.success("Role updated");
      router.refresh();
    });
  }

  function onDelete() {
    const label = userName.trim() || "this user";
    if (!confirm(`Delete ${label}? This removes their login and cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteUserAccount(userId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("User deleted");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        options={ROLE_OPTIONS}
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={pending}
        className="h-8 min-w-[10rem] text-xs"
        aria-label="User role"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending || role === currentRole}
        onClick={saveRole}
      >
        Save
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={onDelete}
        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        Delete
      </Button>
    </div>
  );
}
