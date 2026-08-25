"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createDisciplineIncident,
  identifyDisciplineStudent,
  updateDisciplineStatus,
} from "@/lib/actions/workspaces";
import type { DisciplineIncident } from "@/lib/db/workspaces";
import { toast } from "@/lib/toast";

const STATUSES = ["open", "monitoring", "escalated", "resolved"] as const;

const STATUS_KEYS = {
  open: "statusOpen",
  monitoring: "statusMonitoring",
  escalated: "statusEscalated",
  resolved: "statusResolved",
} as const;

type StudentOption = { id: string; name: string };

export function DisciplineBoard({
  incidents,
  students,
  schoolId,
}: {
  incidents: DisciplineIncident[];
  students: StudentOption[];
  schoolId: string;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [studentId, setStudentId] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifyingId, setIdentifyingId] = useState<string | null>(null);

  function statusLabel(status: string) {
    const key = STATUS_KEYS[status as keyof typeof STATUS_KEYS];
    return key ? t(key) : status;
  }

  function severityLabel(value: string) {
    if (value === "low" || value === "medium" || value === "high") {
      return tc(value);
    }
    return value;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !evidenceUrl) {
      toast.error(t("incidentTitleOrPhotoHint"));
      return;
    }
    setLoading(true);
    const result = await createDisciplineIncident({
      title: title.trim() || undefined,
      severity,
      description: description.trim() || undefined,
      student_id: studentId || undefined,
      evidence_url: evidenceUrl || undefined,
    });
    setLoading(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      studentId ? t("incidentLogged") : t("incidentLoggedForAdmins")
    );
    setTitle("");
    setDescription("");
    setStudentId("");
    setEvidenceUrl("");
    router.refresh();
  }

  async function handleStatus(id: string, status: (typeof STATUSES)[number]) {
    const result = await updateDisciplineStatus(id, status);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleIdentify(incidentId: string, nextStudentId: string) {
    if (!nextStudentId) return;
    setIdentifyingId(incidentId);
    const result = await identifyDisciplineStudent(incidentId, nextStudentId);
    setIdentifyingId(null);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("studentIdentified"));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-xl border border-stone-200 p-4 dark:border-stone-800 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-2">
          <Label htmlFor="discipline-incident">{t("incident")}</Label>
          <Input
            id="discipline-incident"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("incidentPlaceholder")}
          />
        </div>
        <div>
          <Label htmlFor="discipline-student">{t("student")}</Label>
          <select
            id="discipline-student"
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">{t("studentUnknownOption")}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="discipline-severity">{t("severity")}</Label>
          <select
            id="discipline-severity"
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as "low" | "medium" | "high")}
          >
            <option value="low">{tc("low")}</option>
            <option value="medium">{tc("medium")}</option>
            <option value="high">{tc("high")}</option>
          </select>
        </div>
        <div className="lg:col-span-3">
          <Label htmlFor="discipline-notes">{tc("notes")}</Label>
          <Input
            id="discipline-notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("incidentNotesPlaceholder")}
          />
        </div>
        <div className="lg:col-span-4">
          <Label>{t("incidentPhoto")}</Label>
          <p className="mb-2 mt-1 text-xs text-stone-500">{t("incidentPhotoHint")}</p>
          <FileUpload
            bucket="school-assets"
            path={`${schoolId}/discipline`}
            accept="image/jpeg,image/png,image/gif,image/webp"
            value={evidenceUrl || undefined}
            onUpload={(url) => {
              setEvidenceUrl(url);
              toast.success(t("photoUploaded"));
            }}
            onRemove={() => setEvidenceUrl("")}
            onError={(message) => toast.error(message)}
          />
        </div>
        <div className="flex items-end lg:col-span-4">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? tc("saving") : t("logIncident")}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {incidents.length === 0 ? (
          <p className="text-sm text-stone-500">{t("noDisciplineCases")}</p>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900 dark:text-white">
                    {incident.title}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {incident.student_name ?? t("noStudentLinked")} · {severityLabel(incident.severity)} ·{" "}
                    {incident.incident_date}
                  </p>
                  {incident.description && (
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                      {incident.description}
                    </p>
                  )}
                  {incident.evidence_url ? (
                    <a
                      href={incident.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block w-fit"
                    >
                      <img
                        src={incident.evidence_url}
                        alt={t("incidentPhotoAlt")}
                        className="max-h-40 rounded-lg border border-stone-200 object-contain dark:border-stone-700"
                      />
                    </a>
                  ) : null}
                </div>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                  {statusLabel(incident.status)}
                </span>
              </div>
              {!incident.student_id ? (
                <div className="mt-3 max-w-sm">
                  <Label htmlFor={`identify-${incident.id}`}>{t("identifyStudent")}</Label>
                  <select
                    id={`identify-${incident.id}`}
                    className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                    defaultValue=""
                    disabled={identifyingId === incident.id}
                    onChange={(e) => handleIdentify(incident.id, e.target.value)}
                  >
                    <option value="">{t("identifyStudentPlaceholder")}</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.filter((status) => status !== incident.status).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatus(incident.id, status)}
                    className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    {t("markStatus", { status: statusLabel(status) })}
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
