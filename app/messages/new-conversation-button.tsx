"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createConversation } from "@/lib/actions/conversations";
import type { GuardianContact } from "@/lib/db/conversations";

interface Props {
  contacts: GuardianContact[];
}

export function NewConversationButton({ contacts }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<GuardianContact | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Group contacts by class
  const grouped = useMemo(() => {
    const filtered = contacts.filter(
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
  }, [contacts, search]);

  async function handleStart() {
    if (!selected || !message.trim()) {
      toast.error("Select a contact and write a message");
      return;
    }

    if (!selected.profile_id) {
      toast.error("This guardian doesn't have a portal account yet. Use Mass Outreach for WhatsApp messaging.");
      return;
    }

    setLoading(true);
    try {
      const result = await createConversation("", {
        student_id: selected.student_id,
        title: `Chat with ${selected.name} — ${selected.student_name}`,
        participant_profile_ids: [selected.profile_id],
        initial_message: message.trim(),
      });

      if (result.error) {
        toast.error("Failed to start conversation");
        return;
      }

      setOpen(false);
      setSelected(null);
      setMessage("");
      setSearch("");
      router.push(`/messages/${result.data!.id}`);
      toast.success("Conversation started");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        aria-label="New conversation"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">New Conversation</h2>
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

            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[60vh]">
              {/* Contact search */}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {selected ? "Contact" : "Select a parent contact"}
                </p>
                {selected ? (
                  <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 dark:border-indigo-800 dark:bg-indigo-950/40">
                    <div>
                      <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">{selected.name}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        {selected.student_name} · {selected.class_name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Search by parent name, student, or class..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                      {Object.keys(grouped).length === 0 ? (
                        <p className="p-4 text-center text-sm text-slate-400">No contacts found</p>
                      ) : (
                        Object.entries(grouped).map(([className, members]) => (
                          <div key={className}>
                            <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {className}
                            </div>
                            {members.map((c) => (
                              <button
                                key={`${c.guardian_id}-${c.student_id}`}
                                type="button"
                                onClick={() => setSelected(c)}
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                  {c.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                                  <p className="text-xs text-slate-500">{c.student_name} · {c.relation}</p>
                                </div>
                                {!c.profile_id && (
                                  <span className="ml-auto text-xs text-amber-500">No portal account</span>
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

              {/* First message */}
              {selected && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Message</p>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Write your first message to ${selected.name}...`}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
              <Button onClick={handleStart} disabled={!selected || !message.trim() || loading}>
                {loading ? "Starting..." : "Start Conversation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
