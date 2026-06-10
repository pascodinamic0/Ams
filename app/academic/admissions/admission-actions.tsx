"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { convertAdmissionToStudent, updateAdmissionStatus } from "@/lib/actions/admissions";
import { toast } from "@/lib/toast";

export function AdmissionActions({
  id,
  status,
  branchId,
}: {
  id: string;
  status: string;
  branchId: string;
}) {
  const router = useRouter();

  async function approve() {
    if (!branchId) {
      toast.error("Branch required to convert application");
      return;
    }
    const result = await convertAdmissionToStudent(id, branchId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Application approved and student created");
    router.refresh();
  }

  async function reject() {
    const result = await updateAdmissionStatus(id, "rejected");
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Application rejected");
    router.refresh();
  }

  if (status !== "pending") return <span className="text-sm capitalize text-slate-500">{status}</span>;

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={approve}>Approve</Button>
      <Button size="sm" variant="ghost" onClick={reject}>Reject</Button>
    </div>
  );
}
