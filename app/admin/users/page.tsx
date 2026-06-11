import { getUsers } from "@/lib/db";
import { UsersView } from "./users-view";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platform Users
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View and manage every user across all schools — admins, staff, students,
          and guardians.
        </p>
      </div>

      <UsersView users={users} />
    </div>
  );
}
