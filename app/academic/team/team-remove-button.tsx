"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { removeSchoolTeamMember } from "@/lib/actions/invite-user";
import { toast } from "@/lib/toast";

interface TeamRemoveButtonProps {
  userId: string;
  memberName: string;
  /** Cannot remove (self, last academic admin, platform super admin). */
  disabled?: boolean;
  disabledReason?: string;
}

export function TeamRemoveButton({
  userId,
  memberName,
  disabled = false,
  disabledReason,
}: TeamRemoveButtonProps) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (disabled) {
    return (
      <span
        className="inline-flex text-sm text-stone-400 dark:text-stone-500"
        title={disabledReason}
      >
        -
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
      onClick={() => {
        if (!window.confirm(t("removeTeamMemberConfirm", { name: memberName }))) {
          return;
        }
        startTransition(async () => {
          const result = await removeSchoolTeamMember({ userId });
          if ("error" in result && result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(t("teamMemberRemoved"));
          router.refresh();
        });
      }}
    >
      {pending ? t("removing") : tc("remove")}
    </Button>
  );
}
