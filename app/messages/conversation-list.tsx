"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { format, isToday, isYesterday } from "date-fns";
import type { ConversationListItem } from "@/lib/db/conversations";
import { Input } from "@/components/ui/input";

interface Props {
  conversations: ConversationListItem[];
  activeConversationId?: string;
  yesterdayLabel: string;
  emptyHintKey?: "startChatting" | "startChattingParent" | "startChattingStaff";
  showArchived?: boolean;
}

function formatTime(dateStr: string | null, yesterdayLabel: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return yesterdayLabel;
  return format(d, "MMM d");
}

export function ConversationList({
  conversations,
  activeConversationId,
  yesterdayLabel,
  emptyHintKey = "startChattingStaff",
  showArchived = false,
}: Props) {
  const t = useTranslations("messages");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.last_message?.toLowerCase().includes(q) ?? false) ||
        (c.student_name?.toLowerCase().includes(q) ?? false)
    );
  }, [conversations, search]);

  const archiveToggleHref = activeConversationId
    ? showArchived
      ? `/messages/${activeConversationId}`
      : `/messages/${activeConversationId}?archived=1`
    : showArchived
      ? "/messages"
      : "/messages?archived=1";

  return (
    <>
      <div className="space-y-2 border-b border-stone-200 px-3 py-2 dark:border-stone-700">
        <Input
          placeholder={t("searchConversations")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
        <Link
          href={archiveToggleHref}
          className={`inline-block text-xs font-medium ${
            showArchived
              ? "text-primary"
              : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
          }`}
        >
          {showArchived ? t("showActive") : t("showArchived")}
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <svg className="h-6 w-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
              {showArchived ? t("noArchivedConversations") : t("noConversations")}
            </p>
            {!showArchived && <p className="text-xs text-stone-400">{t(emptyHintKey)}</p>}
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-stone-400">{t("noContactsFound")}</li>
          ) : (
            filtered.map((conv) => (
              <li key={conv.id}>
                <Link
                  href={`/messages/${conv.id}${showArchived ? "?archived=1" : ""}`}
                  className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/60 ${
                    conv.id === activeConversationId ? "bg-primary-light dark:bg-primary-light/40" : ""
                  }`}
                >
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-hover dark:bg-primary-light/50 dark:text-primary">
                    {conv.title.charAt(0).toUpperCase()}
                    {conv.unread && (
                      <span
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900"
                        aria-label={t("unreadMessages", { count: 1 })}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-sm text-stone-900 dark:text-white ${
                          conv.unread ? "font-bold" : "font-semibold"
                        }`}
                      >
                        {conv.title}
                      </p>
                      <span className="shrink-0 text-xs text-stone-400">
                        {formatTime(conv.last_message_at ?? conv.created_at, yesterdayLabel)}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        conv.unread ? "font-medium text-stone-700 dark:text-stone-300" : "text-stone-500"
                      }`}
                    >
                      {conv.last_message ?? t("noMessagesYet")}
                    </p>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </>
  );
}
