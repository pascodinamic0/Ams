"use client";

import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
};

export function UpdatePrompt({ open, onUpdate, onDismiss }: Props) {
  const t = useTranslations("pwa");

  return (
    <Dialog
      isOpen={open}
      onClose={onDismiss}
      title={t("updateTitle")}
      description={t("updateDescription")}
      confirmLabel={t("updateNow")}
      cancelLabel={t("updateLater")}
      onConfirm={onUpdate}
    />
  );
}
