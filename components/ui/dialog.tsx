"use client";

import { Modal } from "./modal";
import { Button } from "./button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "primary" | "danger";
  /** When false, the dialog stays open after confirm (e.g. a reload is coming). */
  closeOnConfirm?: boolean;
  confirmBusy?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "primary",
  closeOnConfirm = true,
  confirmBusy = false,
}: DialogProps) {
  const handleConfirm = async () => {
    if (confirmBusy) return;
    await onConfirm();
    if (closeOnConfirm) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={confirmBusy ? () => {} : onClose} title={title}>
      <div className="space-y-4">
        {description && (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {description}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={confirmBusy}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={confirmBusy}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
