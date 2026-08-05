"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createAccountLevelDemands } from "@/lib/actions/invoices";
import { toast } from "@/lib/toast";

type StudentOption = {
  id: string;
  name: string;
  student_id: string | null;
  class_id: string | null;
  class_name: string | null;
};

type FeeStructureOption = {
  id: string;
  name: string;
  amount: number;
  class_id: string | null;
};

type ClassOption = {
  id: string;
  name: string;
};

type Labels = {
  title: string;
  subtitle: string;
  backToInvoices: string;
  selectClass: string;
  allClasses: string;
  feeStructure: string;
  dueDate: string;
  description: string;
  descriptionPlaceholder: string;
  skipExisting: string;
  selectAll: string;
  clearSelection: string;
  previewTitle: string;
  noStudents: string;
  colStudent: string;
  colStudentId: string;
  colClass: string;
  colAmount: string;
  selectedCount: string;
  generate: string;
  generating: string;
  success: string;
  noneSelected: string;
};

interface Props {
  schoolName: string | null;
  students: StudentOption[];
  feeStructures: FeeStructureOption[];
  classes: ClassOption[];
  labels: Labels;
}

export function BulkDemandForm({
  schoolName,
  students,
  feeStructures,
  classes,
  labels,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [classFilter, setClassFilter] = useState("");
  const [feeStructureId, setFeeStructureId] = useState(
    feeStructures[0]?.id ?? ""
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [description, setDescription] = useState("");
  const [skipExisting, setSkipExisting] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const selectedStructure = feeStructures.find((f) => f.id === feeStructureId);

  const visibleStudents = useMemo(() => {
    let list = students;
    if (classFilter) {
      list = list.filter((s) => s.class_id === classFilter);
    } else if (selectedStructure?.class_id) {
      list = list.filter((s) => s.class_id === selectedStructure.class_id);
    }
    return list;
  }, [students, classFilter, selectedStructure?.class_id]);

  const previewRows = useMemo(
    () => visibleStudents.filter((s) => selected.has(s.id)),
    [visibleStudents, selected]
  );

  function toggleStudent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const s of visibleStudents) next.add(s.id);
      return next;
    });
  }

  function clearVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const s of visibleStudents) next.delete(s.id);
      return next;
    });
  }

  function onGenerate() {
    if (!feeStructureId) {
      toast.error(labels.feeStructure);
      return;
    }
    if (previewRows.length === 0) {
      toast.error(labels.noneSelected);
      return;
    }

    startTransition(async () => {
      const result = await createAccountLevelDemands({
        student_ids: previewRows.map((s) => s.id),
        fee_structure_id: feeStructureId,
        due_date: dueDate,
        description: description || undefined,
        skip_existing: skipExisting,
      });

      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create account-level demands"
        );
        return;
      }

      const created = result.data?.created ?? 0;
      const skipped = result.data?.skipped ?? 0;
      toast.success(
        labels.success
          .replace("{created}", String(created))
          .replace("{skipped}", String(skipped))
      );
      router.push("/finance/invoices");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{labels.title}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {labels.subtitle}
            {schoolName ? ` — ${schoolName}` : ""}
          </p>
        </div>
        <Link
          href="/finance/invoices"
          className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
        >
          {labels.backToInvoices}
        </Link>
      </div>

      <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="class_filter">{labels.selectClass}</Label>
          <select
            id="class_filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            <option value="">{labels.allClasses}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="fee_structure_id" required>
            {labels.feeStructure}
          </Label>
          <select
            id="fee_structure_id"
            value={feeStructureId}
            onChange={(e) => setFeeStructureId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            {feeStructures.length === 0 ? (
              <option value="">—</option>
            ) : (
              feeStructures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.amount}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <Label htmlFor="due_date" required>
            {labels.dueDate}
          </Label>
          <Input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">{labels.description}</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={labels.descriptionPlaceholder}
          />
        </div>
        <div className="flex items-end">
          <Checkbox
            id="skip_existing"
            checked={skipExisting}
            onChange={(e) => setSkipExisting(e.target.checked)}
            label={labels.skipExisting}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={selectAllVisible}>
          {labels.selectAll}
        </Button>
        <Button type="button" variant="ghost" onClick={clearVisible}>
          {labels.clearSelection}
        </Button>
        <p className="text-sm text-stone-500">
          {labels.selectedCount.replace("{count}", String(previewRows.length))}
        </p>
      </div>

      {visibleStudents.length === 0 ? (
        <p className="text-sm text-stone-500">{labels.noStudents}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-stone-50 text-left dark:bg-stone-900">
              <tr>
                <th className="px-3 py-2 w-10" />
                <th className="px-3 py-2 font-medium">{labels.colStudent}</th>
                <th className="px-3 py-2 font-medium">{labels.colStudentId}</th>
                <th className="px-3 py-2 font-medium">{labels.colClass}</th>
                <th className="px-3 py-2 font-medium text-right">
                  {labels.colAmount}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((s) => (
                <tr
                  key={s.id}
                  className="border-t dark:border-stone-800"
                >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selected.has(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      aria-label={s.name}
                    />
                  </td>
                  <td className="px-3 py-2">{s.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {s.student_id ?? "—"}
                  </td>
                  <td className="px-3 py-2">{s.class_name ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {selectedStructure?.amount ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewRows.length > 0 && (
        <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/30">
          <h2 className="font-semibold">{labels.previewTitle}</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {labels.selectedCount.replace(
              "{count}",
              String(previewRows.length)
            )}
            {selectedStructure
              ? ` · ${selectedStructure.name} · ${selectedStructure.amount}`
              : ""}
            {` · ${dueDate}`}
          </p>
        </div>
      )}

      <Button
        type="button"
        onClick={onGenerate}
        disabled={isPending || previewRows.length === 0 || !feeStructureId}
      >
        {isPending ? labels.generating : labels.generate}
      </Button>
    </div>
  );
}
