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
import { DeleteSchoolButton } from "./delete-school-button";

export function SchoolStatusActions({
  schoolId,
  schoolName,
  status,
  redirectAfterDelete = false,
  stacked = false,
}: {
  schoolId: string;
  schoolName: string;
  status: SchoolStatus;
  redirectAfterDelete?: boolean;
  stacked?: boolean;
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

  const layoutClass = stacked
    ? "flex flex-col gap-2 [&_button]:w-full"
    : "flex flex-wrap gap-2";

  return (
    <div className={layoutClass}>
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
      <DeleteSchoolButton
        schoolId={schoolId}
        schoolName={schoolName}
        redirectToList={redirectAfterDelete}
      />
    </div>
  );
}
