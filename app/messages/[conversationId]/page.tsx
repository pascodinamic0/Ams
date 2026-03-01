import { notFound } from "next/navigation";
import { getConversationById, getConversations, getGuardianContacts } from "@/lib/db/conversations";
import { createClient } from "@/lib/supabase/server";
import { format, isToday } from "date-fns";
import Link from "next/link";
import { ChatPanel } from "./chat-panel";
import { NewConversationButton } from "../new-conversation-button";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  return format(d, "MMM d, h:mm a");
}

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [conv, allConversations, contacts] = await Promise.all([
    getConversationById(conversationId),
    getConversations(),
    getGuardianContacts(),
  ]);

  if (!conv) notFound();

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      {/* Left panel: conversation list */}
      <div className="hidden w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:flex">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Conversations</h2>
          <NewConversationButton contacts={contacts} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {allConversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    c.id === conversationId ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {c.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                      <span className="shrink-0 text-xs text-slate-400">
                        {c.last_message_at ? format(new Date(c.last_message_at), isToday(new Date(c.last_message_at)) ? "h:mm a" : "MMM d") : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{c.last_message ?? "No messages yet"}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel: active chat */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-slate-700">
          <Link
            href="/messages"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {conv.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{conv.title}</p>
            {conv.student_name && (
              <p className="text-xs text-slate-500">Student: {conv.student_name}</p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {conv.participants.map((p) => (
              <div
                key={p.profile_id}
                title={`${p.name} (${p.role})`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              >
                {p.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel (client: real-time messages + input) */}
        <ChatPanel
          conversationId={conv.id}
          initialMessages={conv.messages}
          currentUserId={user?.id ?? ""}
        />
      </div>
    </div>
  );
}
