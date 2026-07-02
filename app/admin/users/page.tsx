import { getUsers } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { UsersView } from "./users-view";

export default async function UsersPage() {
  const t = await getTranslations("admin");
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          {t("usersTitle")}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("usersSubtitle")}
        </p>
      </div>

      <UsersView users={users} />
    </div>
  );
}
