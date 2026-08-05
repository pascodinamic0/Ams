"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSchoolTask, updateSchoolTaskStatus } from "@/lib/actions/workspaces";
import type { SchoolTask } from "@/lib/db/workspaces";
import { toast } from "@/lib/toast";

const STATUSES = ["todo", "in_progress", "blocked", "done"] as const;

export function TaskBoard({ tasks }: { tasks: SchoolTask[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("general");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createSchoolTask({
      title,
      department,
      priority,
      due_date: dueDate || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Task created");
    setTitle("");
    setDueDate("");
    router.refresh();
  }

  async function handleStatus(id: string, status: (typeof STATUSES)[number]) {
    const result = await updateSchoolTaskStatus(id, status);
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
        className="overflow-hidden rounded-xl border border-stone-200 p-4 dark:border-stone-800"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto]">
          <div className="min-w-0 sm:col-span-2 xl:col-span-1">
            <Label>Task</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up unpaid fees for Nursery 1"
              required
            />
          </div>
          <div className="min-w-0">
            <Label>Department</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="admissions"
            />
          </div>
          <div className="min-w-0">
            <Label>Priority</Label>
            <select
              className="mt-1 w-full min-w-0 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="min-w-0">
            <Label>Due</Label>
            <Input
              type="date"
              className="min-w-0"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="flex items-end sm:col-span-2 xl:col-span-1">
            <Button type="submit" disabled={loading} className="w-full shrink-0 xl:w-auto">
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-4">
        {STATUSES.map((status) => {
          const column = tasks.filter((task) => task.status === status);
          return (
            <div
              key={status}
              className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40"
            >
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                {status.replace(/_/g, " ")} ({column.length})
              </h2>
              <div className="space-y-3">
                {column.length === 0 ? (
                  <p className="text-sm text-stone-400">No tasks</p>
                ) : (
                  column.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-950"
                    >
                      <p className="text-sm font-medium text-stone-900 dark:text-white">
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {task.department} · {task.priority}
                        {task.due_date ? ` · due ${task.due_date}` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {STATUSES.filter((s) => s !== task.status).map((next) => (
                          <button
                            key={next}
                            type="button"
                            onClick={() => handleStatus(task.id, next)}
                            className="rounded-full border border-stone-200 px-2 py-0.5 text-[11px] text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                          >
                            {next.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
