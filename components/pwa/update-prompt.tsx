"use client";

import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  updating?: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
};

export function UpdatePrompt({ open, updating = false, onUpdate, onDismiss }: Props) {
  const t = useTranslations("pwa");

  return (
    <Dialog
      isOpen={open}
      onClose={updating ? () => {} : onDismiss}
      title={t("updateTitle")}
      description={t("updateDescription")}
      confirmLabel={updating ? t("updatingNow") : t("updateNow")}
      cancelLabel={t("updateLater")}
      onConfirm={onUpdate}
      closeOnConfirm={false}
      confirmBusy={updating}
    />
  );
}
