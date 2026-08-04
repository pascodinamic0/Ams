"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createDisciplineIncident,
  updateDisciplineStatus,
} from "@/lib/actions/workspaces";
import type { DisciplineIncident } from "@/lib/db/workspaces";
import { toast } from "@/lib/toast";

const STATUSES = ["open", "monitoring", "escalated", "resolved"] as const;

export function DisciplineBoard({
  incidents,
  students,
}: {
  incidents: DisciplineIncident[];
  students: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [studentId, setStudentId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createDisciplineIncident({
      title,
      severity,
      description: description || undefined,
      student_id: studentId || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Incident logged");
    setTitle("");
    setDescription("");
    setStudentId("");
    router.refresh();
  }

  async function handleStatus(id: string, status: (typeof STATUSES)[number]) {
    const result = await updateDisciplineStatus(id, status);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-xl border border-stone-200 p-4 dark:border-stone-800 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-2">
          <Label>Incident</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Late arrival / classroom disruption"
            required
          />
        </div>
        <div>
          <Label>Student</Label>
          <select
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">Optional</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Severity</Label>
          <select
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as "low" | "medium" | "high")}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="lg:col-span-3">
          <Label>Notes</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened and what follow-up is needed"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Log incident"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {incidents.length === 0 ? (
          <p className="text-sm text-stone-500">No discipline cases yet.</p>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-stone-900 dark:text-white">
                    {incident.title}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {incident.student_name ?? "No student linked"} · {incident.severity} ·{" "}
                    {incident.incident_date}
                  </p>
                  {incident.description && (
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                      {incident.description}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                  {incident.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.filter((status) => status !== incident.status).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatus(incident.id, status)}
                    className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    Mark {status}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
