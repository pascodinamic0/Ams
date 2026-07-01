"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createConversation } from "@/lib/actions/conversations";
import type { GuardianContact, StaffContact } from "@/lib/db/conversations";

const STAFF_ROLES = new Set(["super_admin", "academic_admin", "teacher"]);

export function canCreateConversation(role: string): boolean {
  return STAFF_ROLES.has(role) || role === "parent";
}

interface Props {
  role: string;
  schoolId: string;
  guardianContacts?: GuardianContact[];
  staffContacts?: StaffContact[];
}

export function NewConversationButton({
  role,
  schoolId,
  guardianContacts = [],
  staffContacts = [],
}: Props) {
  const router = useRouter();
  const t = useTranslations("messages");
  const isParent = role === "parent";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianContact | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffContact | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!canCreateConversation(role)) return null;

  const guardianGrouped = useMemo(() => {
    const filtered = guardianContacts.filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.student_name.toLowerCase().includes(search.toLowerCase()) ||
        c.class_name.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.reduce<Record<string, GuardianContact[]>>((acc, c) => {
      const key = c.class_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});
  }, [guardianContacts, search]);

  const staffFiltered = useMemo(() => {
    return staffContacts.filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.student_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        c.context.toLowerCase().includes(search.toLowerCase())
    );
  }, [staffContacts, search]);

  function resetForm() {
    setOpen(false);
    setSelectedGuardian(null);
    setSelectedStaff(null);
    setMessage("");
    setSearch("");
  }

  async function handleStart() {
    if (isParent) {
      if (!selectedStaff || !message.trim()) {
        toast.error(t("selectContactAndMessage"));
        return;
      }

      setLoading(true);
      try {
        const studentId = selectedStaff.student_id ?? undefined;
        const title = selectedStaff.student_name
          ? `Chat with ${selectedStaff.name} — ${selectedStaff.student_name}`
          : `Chat with ${selectedStaff.name}`;

        const result = await createConversation(schoolId, {
          student_id: studentId,
          title,
          participant_profile_ids: [selectedStaff.profile_id],
          initial_message: message.trim(),
        });

        if (result.error) {
          toast.error(t("failedStartConversation"));
          return;
        }

        resetForm();
        router.push(`/messages/${result.data!.id}`);
        toast.success(
          result.data?.existing ? t("openingExistingConversation") : t("conversationStarted")
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!selectedGuardian || !message.trim()) {
      toast.error(t("selectContactAndMessage"));
      return;
    }

    if (!selectedGuardian.profile_id) {
      toast.error(t("noPortalAccount"));
      return;
    }

    setLoading(true);
    try {
      const result = await createConversation(schoolId, {
        student_id: selectedGuardian.student_id,
        title: `Chat with ${selectedGuardian.name} — ${selectedGuardian.student_name}`,
        participant_profile_ids: [selectedGuardian.profile_id],
        initial_message: message.trim(),
      });

      if (result.error) {
        toast.error(t("failedStartConversation"));
        return;
      }

      resetForm();
      router.push(`/messages/${result.data!.id}`);
      toast.success(
        result.data?.existing ? t("openingExistingConversation") : t("conversationStarted")
      );
    } finally {
      setLoading(false);
    }
  }

  const selected = isParent ? selectedStaff : selectedGuardian;
  const selectedName = isParent
    ? selectedStaff?.name
    : selectedGuardian?.name;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        aria-label={t("newConversation")}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">{t("newConversationTitle")}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] flex-1 space-y-4 overflow-y-auto p-5">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {selected ? t("contact") : isParent ? t("selectStaffContact") : t("selectParentContact")}
                </p>
                {selected ? (
                  <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 dark:border-indigo-800 dark:bg-indigo-950/40">
                    <div>
                      <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                        {selectedName}
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        {isParent && selectedStaff
                          ? selectedStaff.context
                          : selectedGuardian
                            ? `${selectedGuardian.student_name} · ${selectedGuardian.class_name}`
                            : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuardian(null);
                        setSelectedStaff(null);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      {t("change")}
                    </button>
                  </div>
                ) : isParent ? (
                  <>
                    <Input
                      placeholder={t("searchStaffPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                      {staffFiltered.length === 0 ? (
                        <p className="p-4 text-center text-sm text-slate-400">{t("noContactsFound")}</p>
                      ) : (
                        staffFiltered.map((c) => (
                          <button
                            key={`${c.profile_id}-${c.student_id ?? "general"}`}
                            type="button"
                            onClick={() => setSelectedStaff(c)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.context}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder={t("searchParentPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                      {Object.keys(guardianGrouped).length === 0 ? (
                        <p className="p-4 text-center text-sm text-slate-400">{t("noContactsFound")}</p>
                      ) : (
                        Object.entries(guardianGrouped).map(([className, members]) => (
                          <div key={className}>
                            <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {className}
                            </div>
                            {members.map((c) => (
                              <button
                                key={`${c.guardian_id}-${c.student_id}`}
                                type="button"
                                onClick={() => setSelectedGuardian(c)}
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                  {c.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                                  <p className="text-xs text-slate-500">
                                    {c.student_name} · {c.relation}
                                  </p>
                                </div>
                                {!c.profile_id && (
                                  <span className="ml-auto text-xs text-amber-500">
                                    {t("noPortalAccountShort")}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {selected && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t("message")}</p>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("writeFirstMessage", { name: selectedName ?? "" })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                {t("cancel")}
              </Button>
              <Button onClick={handleStart} disabled={!selected || !message.trim() || loading}>
                {loading ? t("starting") : t("startConversation")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
