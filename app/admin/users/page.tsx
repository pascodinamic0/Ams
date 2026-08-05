import { getBranches, getSchools, getUsers } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { AdminInviteForm } from "./admin-invite-form";
import { UsersView } from "./users-view";

export default async function UsersPage() {
  const t = await getTranslations("admin");
  const [users, schools, campuses] = await Promise.all([
    getUsers(),
    getSchools(),
    getBranches(),
  ]);

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

      <AdminInviteForm
        schools={schools.map((s) => ({ id: s.id, name: s.name }))}
        campuses={campuses.map((c) => ({
          id: c.id,
          name: c.name,
          school_id: c.school_id,
        }))}
      />

      <UsersView users={users} />
    </div>
  );
}
