"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSchoolTask,
  deleteSchoolTask,
  updateSchoolTaskStatus,
} from "@/lib/actions/workspaces";
import { decideExpenseTask } from "@/lib/actions/expenses";
import type { SchoolTask } from "@/lib/db/workspaces";
import { toast } from "@/lib/toast";

const STATUSES = ["todo", "in_progress", "blocked", "done"] as const;

const STATUS_KEYS = {
  todo: "statusTodo",
  in_progress: "statusInProgress",
  blocked: "statusBlocked",
  done: "statusDone",
} as const;

type StaffOption = {
  id: string;
  name: string;
  role: string;
};

export function TaskBoard({
  tasks = [],
  staff = [],
}: {
  tasks?: SchoolTask[];
  staff?: StaffOption[];
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const tRoles = useTranslations("roles");
  const te = useTranslations("errors");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("unassigned");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function statusLabel(status: (typeof STATUSES)[number]) {
    return t(STATUS_KEYS[status]);
  }

  function priorityLabel(value: string) {
    if (value === "low" || value === "medium" || value === "high") {
      return tc(value);
    }
    return value;
  }

  function roleLabel(role: string) {
    return tRoles.has(role) ? tRoles(role as Parameters<typeof tRoles>[0]) : role.replace(/_/g, " ");
  }

  function assigneeLabel(task: SchoolTask): string {
    if (task.department === "everyone") return tc("everyone");
    if (task.assigned_name?.trim()) return task.assigned_name.trim();
    if (task.assigned_to) return tc("assigned");
    return tc("unassigned");
  }

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
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("taskCreated"));
    setTitle("");
    setAssignee("unassigned");
    setDueDate("");
    router.refresh();
  }

  async function handleStatus(id: string, status: (typeof STATUSES)[number]) {
    const result = await updateSchoolTaskStatus(id, status);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete(task: SchoolTask) {
    const isPendingExpense =
      task.related_type === "expense" && task.status !== "done";
    if (isPendingExpense) {
      toast.error(te("rejectOrApproveExpense"));
      return;
    }

    if (!confirm(t("deleteTaskConfirm", { title: task.title }))) return;

    setDeletingId(task.id);
    const result = await deleteSchoolTask(task.id);
    setDeletingId(null);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("taskDeleted"));
    router.refresh();
  }

  async function handleExpenseDecision(
    taskId: string,
    decision: "approved" | "rejected"
  ) {
    setDecidingId(taskId);
    const result = await decideExpenseTask(taskId, decision);
    setDecidingId(null);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    if ("data" in result && decision === "approved" && result.data?.receiptNumber) {
      toast.success(t("expenseApprovedReceipt", { number: result.data.receiptNumber }));
    } else if (decision === "approved") {
      toast.success(t("expenseApproved"));
    } else {
      toast.success(t("expenseRejected"));
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
          <Label>{t("taskLabel")}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("taskPlaceholder")}
            required
          />
        </div>
        <div className="min-w-0">
          <Label>{tc("assignee")}</Label>
          <select
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="unassigned">{tc("unassigned")}</option>
            <option value="everyone">{tc("everyone")}</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
                {member.role ? ` (${roleLabel(member.role)})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <Label>{tc("priority")}</Label>
          <select
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
          >
            <option value="low">{tc("low")}</option>
            <option value="medium">{tc("medium")}</option>
            <option value="high">{tc("high")}</option>
          </select>
        </div>
        <div className="min-w-0">
          <Label>{tc("due")}</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="flex min-w-0 items-end">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? tc("adding") : tc("add")}
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
                {statusLabel(status)} ({column.length})
              </h2>
              <div className="space-y-3">
                {column.length === 0 ? (
                  <p className="text-sm text-stone-400">{t("noTasks")}</p>
                ) : (
                  column.map((task) => {
                    const isExpense = task.related_type === "expense";
                    const pendingExpense =
                      isExpense && task.status !== "done";
                    const canDelete = !pendingExpense;
                    return (
                      <div
                        key={task.id}
                        className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-950"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-stone-900 dark:text-white">
                            {task.title}
                          </p>
                          {canDelete ? (
                            <button
                              type="button"
                              aria-label={t("deleteTaskAria")}
                              disabled={deletingId === task.id}
                              onClick={() => handleDelete(task)}
                              className="shrink-0 rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                        {isExpense ? (
                          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                            {t("financeExpenseApproval")}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-stone-500">
                          {assigneeLabel(task)} · {priorityLabel(task.priority)}
                          {task.due_date ? ` · ${t("dueOn", { date: task.due_date })}` : ""}
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
                              {decidingId === task.id ? "..." : t("approve")}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={decidingId === task.id}
                              onClick={() => handleExpenseDecision(task.id, "rejected")}
                            >
                              {t("reject")}
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
                                {t("receiptNumber", { number: task.related_receipt_number })}
                              </Link>
                            ) : null}
                            {isExpense && task.related_expense_status === "rejected" ? (
                              <span className="rounded-full border border-red-200 px-2 py-0.5 text-[11px] text-red-700 dark:border-red-900 dark:text-red-300">
                                {tc("rejected")}
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
                                    {statusLabel(next)}
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
