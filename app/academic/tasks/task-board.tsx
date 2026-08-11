"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSchoolTask,
  updateSchoolTaskStatus,
} from "@/lib/actions/workspaces";
import { decideExpenseTask } from "@/lib/actions/expenses";
import type { SchoolTask } from "@/lib/db/workspaces";
import { toast } from "@/lib/toast";

const STATUSES = ["todo", "in_progress", "blocked", "done"] as const;

type StaffOption = {
  id: string;
  name: string;
  role: string;
};

function assigneeLabel(task: SchoolTask): string {
  if (task.department === "everyone") return "Everyone";
  if (task.assigned_name?.trim()) return task.assigned_name.trim();
  if (task.assigned_to) return "Assigned";
  return "Unassigned";
}

export function TaskBoard({
  tasks = [],
  staff = [],
}: {
  tasks?: SchoolTask[];
  staff?: StaffOption[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("unassigned");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createSchoolTask({
      title,
      assignee,
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
    setAssignee("unassigned");
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

  async function handleExpenseDecision(
    taskId: string,
    decision: "approved" | "rejected"
  ) {
    setDecidingId(taskId);
    const result = await decideExpenseTask(taskId, decision);
    setDecidingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (decision === "approved" && result.data?.receiptNumber) {
      toast.success(`Approved — receipt ${result.data.receiptNumber}`);
    } else if (decision === "approved") {
      toast.success("Expense approved");
    } else {
      toast.success("Expense rejected");
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 p-4 dark:border-stone-800 sm:grid-cols-2 xl:grid-cols-6"
      >
        <div className="min-w-0 sm:col-span-2 xl:col-span-2">
          <Label>Task</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Follow up unpaid fees for Nursery 1"
            required
          />
        </div>
        <div className="min-w-0">
          <Label>Assignee</Label>
          <select
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="unassigned">Unassigned</option>
            <option value="everyone">Everyone</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
                {member.role ? ` (${member.role.replace(/_/g, " ")})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <Label>Priority</Label>
          <select
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
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
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="flex min-w-0 items-end">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((status) => {
          const column = tasks.filter((task) => task.status === status);
          return (
            <div
              key={status}
              className="min-w-0 rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40"
            >
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                {status.replace(/_/g, " ")} ({column.length})
              </h2>
              <div className="space-y-3">
                {column.length === 0 ? (
                  <p className="text-sm text-stone-400">No tasks</p>
                ) : (
                  column.map((task) => {
                    const isExpense = task.related_type === "expense";
                    const pendingExpense =
                      isExpense && task.status !== "done";
                    return (
                      <div
                        key={task.id}
                        className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-950"
                      >
                        <p className="text-sm font-medium text-stone-900 dark:text-white">
                          {task.title}
                        </p>
                        {isExpense ? (
                          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                            Finance expense approval
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-stone-500">
                          {assigneeLabel(task)} · {task.priority}
                          {task.due_date ? ` · due ${task.due_date}` : ""}
                        </p>
                        {task.description ? (
                          <p className="mt-2 whitespace-pre-wrap text-xs text-stone-600 dark:text-stone-400">
                            {task.description}
                          </p>
                        ) : null}
                        {pendingExpense ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={decidingId === task.id}
                              onClick={() => handleExpenseDecision(task.id, "approved")}
                            >
                              {decidingId === task.id ? "..." : "Approve"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={decidingId === task.id}
                              onClick={() => handleExpenseDecision(task.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {isExpense &&
                            task.related_id &&
                            task.related_expense_status === "approved" &&
                            task.related_receipt_number ? (
                              <Link
                                href={`/finance/expenses/${task.related_id}/receipt`}
                                className="rounded-full border border-stone-200 px-2 py-0.5 text-[11px] text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                              >
                                Receipt {task.related_receipt_number}
                              </Link>
                            ) : null}
                            {isExpense && task.related_expense_status === "rejected" ? (
                              <span className="rounded-full border border-red-200 px-2 py-0.5 text-[11px] text-red-700 dark:border-red-900 dark:text-red-300">
                                Rejected
                              </span>
                            ) : null}
                            {!isExpense
                              ? STATUSES.filter((s) => s !== task.status).map((next) => (
                                  <button
                                    key={next}
                                    type="button"
                                    onClick={() => handleStatus(task.id, next)}
                                    className="rounded-full border border-stone-200 px-2 py-0.5 text-[11px] text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                                  >
                                    {next.replace(/_/g, " ")}
                                  </button>
                                ))
                              : null}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
