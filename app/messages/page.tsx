import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getConversations, getGuardianContacts } from "@/lib/db/conversations";
import { createClient } from "@/lib/supabase/server";
import { format, isToday, isYesterday } from "date-fns";
import { NewConversationButton } from "./new-conversation-button";
import { getTranslations } from "next-intl/server";

function formatTime(dateStr: string | null, yesterdayLabel: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return yesterdayLabel;
  return format(d, "MMM d");
}

export default async function MessagesPage() {
  const t = await getTranslations("messages");
  const tc = await getTranslations("common");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let schoolId = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single();
    schoolId = profile?.school_id ?? "";
  }

  const [conversations, contacts] = await Promise.all([
    getConversations(),
    getGuardianContacts(),
  ]);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      <div className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">{t("conversations")}</h2>
          <NewConversationButton contacts={contacts} schoolId={schoolId} />
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("noConversations")}</p>
                <p className="text-xs text-slate-400">{t("startChatting")}</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <Link
                    href={`/messages/${conv.id}`}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {conv.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{conv.title}</p>
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatTime(conv.last_message_at ?? conv.created_at, tc("yesterday"))}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {conv.last_message ?? t("noMessagesYet")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">{t("selectConversation")}</h3>
          <p className="mt-1 text-sm text-slate-400">{t("startNewWithParent")}</p>
        </div>
      </div>
    </div>
  );
}
