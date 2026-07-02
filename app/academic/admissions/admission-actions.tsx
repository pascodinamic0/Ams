"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("academic");
  const router = useRouter();

  async function approve() {
    if (!branchId) {
      toast.error(t("branchRequiredApprove"));
      return;
    }
    const result = await convertAdmissionToStudent(id, branchId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("applicationApproved"));
    router.refresh();
  }

  async function reject() {
    const result = await updateAdmissionStatus(id, "rejected");
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("applicationRejected"));
    router.refresh();
  }

  if (status !== "pending") return <span className="text-sm capitalize text-stone-500">{status}</span>;

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={approve}>{t("approve")}</Button>
      <Button size="sm" variant="ghost" onClick={reject}>{t("reject")}</Button>
    </div>
  );
}
