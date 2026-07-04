import { getConversations, getGuardianContacts, getStaffContactsForParent } from "@/lib/db/conversations";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { ConversationList } from "./conversation-list";
import { NewConversationButton } from "./new-conversation-button";

export default async function MessagesPage() {
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

  const [conversations, guardianContacts, staffContacts] = await Promise.all([
    getConversations(),
    isParent ? Promise.resolve([]) : getGuardianContacts(),
    isParent ? getStaffContactsForParent() : Promise.resolve([]),
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-0 overflow-hidden md:gap-4 md:h-[calc(100vh-8rem)] md:flex-row">
      <div className="flex min-h-0 w-full flex-1 flex-col rounded-none border-0 bg-white md:w-80 md:shrink-0 md:rounded-xl md:border md:border-stone-200 dark:bg-stone-900 md:dark:border-stone-700">
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
            conversations={conversations}
            yesterdayLabel={tc("yesterday")}
          />
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 md:flex">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-stone-700 dark:text-stone-300">
            {t("selectConversation")}
          </h3>
          <p className="mt-1 text-sm text-stone-400">
            {isParent ? t("startNewWithStaff") : t("startNewWithParent")}
          </p>
        </div>
      </div>
    </div>
  );
}
