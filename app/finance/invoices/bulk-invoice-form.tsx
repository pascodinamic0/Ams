"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createInvoicesBulk } from "@/lib/actions/invoices";
import { toast } from "@/lib/toast";

type FeeStructureOption = {
  id: string;
  name: string;
  amount: number;
  class_id: string | null;
};

type ClassOption = { id: string; name: string };

export function BulkInvoiceForm({
  feeStructures,
  classes,
}: {
  feeStructures: FeeStructureOption[];
  classes: ClassOption[];
}) {
  const t = useTranslations("finance");
  const router = useRouter();
  const [feeStructureId, setFeeStructureId] = useState(feeStructures[0]?.id ?? "");
  const [classId, setClassId] = useState(
    feeStructures[0]?.class_id ?? classes[0]?.id ?? ""
  );
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedStructure = useMemo(
    () => feeStructures.find((f) => f.id === feeStructureId) ?? null,
    [feeStructures, feeStructureId]
  );

  function onStructureChange(value: string) {
    setFeeStructureId(value);
    const structure = feeStructures.find((f) => f.id === value);
    if (structure?.class_id) setClassId(structure.class_id);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feeStructureId || !classId || !dueDate) {
      toast.error(t("bulkInvoiceMissingFields"));
      return;
    }

    startTransition(async () => {
      const result = await createInvoicesBulk({
        fee_structure_id: feeStructureId,
        class_id: classId,
        due_date: dueDate,
        description: description.trim() || undefined,
      });

      if (result.error) {
        const message =
          typeof result.error === "string"
            ? result.error
            : t("bulkInvoiceFailed");
        toast.error(message);
        return;
      }

      toast.success(
        t("bulkInvoiceCreated", {
          created: result.data!.created,
          skipped: result.data!.skipped,
        })
      );
      router.refresh();
    });
  }

  if (feeStructures.length === 0 || classes.length === 0) {
    return (
      <p className="text-sm text-stone-500">{t("bulkInvoiceNeedsSetup")}</p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 p-4 dark:border-stone-700">
      <div>
        <h2 className="font-semibold text-stone-900 dark:text-white">
          {t("bulkInvoiceTitle")}
        </h2>
        <p className="mt-1 text-sm text-stone-500">{t("bulkInvoiceDesc")}</p>
      </div>
      <form
        onSubmit={onSubmit}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <Label required>{t("colFeeType")}</Label>
          <Select
            options={feeStructures.map((f) => ({
              value: f.id,
              label: `${f.name} — ${f.amount}`,
            }))}
            value={feeStructureId}
            onChange={(e) => onStructureChange(e.target.value)}
          />
        </div>
        <div>
          <Label required>{t("colClass")}</Label>
          <Select
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bulk_due_date" required>
            {t("colDueDate")}
          </Label>
          <Input
            id="bulk_due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="bulk_description">{t("descriptionLabel")}</Label>
          <Input
            id="bulk_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={selectedStructure?.name}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("bulkInvoiceGenerating") : t("bulkInvoiceGenerate")}
          </Button>
        </div>
      </form>
    </div>
  );
}
