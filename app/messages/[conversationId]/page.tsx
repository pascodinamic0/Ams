import { notFound } from "next/navigation";
import {
  getConversationById,
  getConversations,
  getGuardianContacts,
  getStaffContactsForParent,
} from "@/lib/db/conversations";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChatPanel } from "./chat-panel";
import { ConversationList } from "../conversation-list";
import { NewConversationButton } from "../new-conversation-button";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const t = await getTranslations("messages");
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let schoolId = "";
  let role = "teacher";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id, role")
      .eq("id", user.id)
      .single();
    schoolId = profile?.school_id ?? "";
    if (profile?.role) role = profile.role;
  }

  const isParent = role === "parent";

  const [conv, allConversations, guardianContacts, staffContacts] = await Promise.all([
    getConversationById(conversationId),
    getConversations(),
    isParent ? Promise.resolve([]) : getGuardianContacts(),
    isParent ? getStaffContactsForParent() : Promise.resolve([]),
  ]);

  if (!conv) notFound();

  const senderNames = Object.fromEntries(
    conv.messages.map((m) => [m.sender_id, m.sender_name])
  );
  for (const p of conv.participants) {
    senderNames[p.profile_id] = p.name;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden md:gap-4 md:h-[calc(100vh-8rem)] md:flex-row">
      <div className="hidden w-72 shrink-0 flex-col rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 lg:flex">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <h2 className="font-semibold text-stone-900 dark:text-white">{t("conversations")}</h2>
          <NewConversationButton
            role={role}
            schoolId={schoolId}
            guardianContacts={guardianContacts}
            staffContacts={staffContacts}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={allConversations}
            activeConversationId={conversationId}
            yesterdayLabel={tc("yesterday")}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 bg-white md:rounded-xl md:border md:border-stone-200 dark:bg-stone-900 md:dark:border-stone-700">
        <div className="flex items-center gap-3 border-b border-stone-200 px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] dark:border-stone-700 md:px-5 md:pt-3.5">
          <Link
            href="/messages"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-hover dark:bg-primary-light/50 dark:text-primary">
            {conv.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-stone-900 dark:text-white">{conv.title}</p>
            {conv.student_name && (
              <p className="text-xs text-stone-500">{t("studentLabel", { name: conv.student_name })}</p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {conv.participants.map((p) => (
              <div
                key={p.profile_id}
                title={`${p.name} (${p.role})`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600 dark:bg-stone-700 dark:text-stone-300"
              >
                {p.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        <ChatPanel
          conversationId={conv.id}
          initialMessages={conv.messages}
          currentUserId={user?.id ?? ""}
          senderNames={senderNames}
        />
      </div>
    </div>
  );
}
