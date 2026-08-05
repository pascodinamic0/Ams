import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

/**
 * Students do not use the staff/parent messaging inbox.
 * Teachers and parents communicate about the student via /messages.
 */
export default async function StudentMessagesPage() {
  const t = await getTranslations("student");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          {t("messagesTitle")}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{t("messagesSubtitle")}</p>
      </div>
      <EmptyState
        title={t("messagesUnavailableTitle")}
        description={t("messagesUnavailableDesc")}
      />
    </div>
  );
}
