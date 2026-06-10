"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  approveSchool,
  rejectSchool,
  suspendSchool,
} from "@/lib/actions/school-approval";
import { toast } from "@/lib/toast";
import type { SchoolStatus } from "@/lib/db/schools";

export function SchoolStatusActions({
  schoolId,
  status,
}: {
  schoolId: string;
  status: SchoolStatus;
}) {
  const router = useRouter();

  async function run(
    action: () => Promise<{ error?: string; data?: unknown }>,
    success: string
  ) {
    const result = await action();
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(success);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "pending" && (
        <>
          <Button
            size="sm"
            onClick={() => run(() => approveSchool(schoolId), "School approved")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              run(() => rejectSchool(schoolId), "School rejected (suspended)")
            }
          >
            Reject
          </Button>
        </>
      )}
      {status === "approved" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => run(() => suspendSchool(schoolId), "School suspended")}
        >
          Suspend
        </Button>
      )}
      {status === "suspended" && (
        <Button
          size="sm"
          onClick={() => run(() => approveSchool(schoolId), "School re-approved")}
        >
          Re-approve
        </Button>
      )}
    </div>
  );
}
