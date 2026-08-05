import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { getGuardians } from "@/lib/db/guardians";

export default async function GuardiansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const { q } = await searchParams;
  const search = q?.trim() || undefined;
  const guardians = await getGuardians({ search });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            {t("guardiansTitle")}
          </h1>
          <p className="mt-1 text-sm text-stone-500">{t("guardiansSubtitle")}</p>
        </div>
        <Link href="/academic/students/new">
          <Button>{t("onboardStudent")}</Button>
        </Link>
      </div>

      <form className="flex max-w-md gap-2">
        <Input
          name="q"
          defaultValue={search ?? ""}
          placeholder={t("searchGuardians")}
          aria-label={t("searchGuardians")}
        />
        <Button type="submit" variant="outline">
          {tc("search")}
        </Button>
      </form>

      {guardians.length === 0 ? (
        <EmptyState
          title={t("noGuardians")}
          description={t("noGuardiansDesc")}
          action={
            <Link href="/academic/students/new">
              <Button variant="outline">{t("onboardStudent")}</Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={guardians}
          columns={[
            { id: "name", header: tc("name"), accessorKey: "name", sortable: true },
            { id: "email", header: tc("email"), accessorKey: "email" },
            { id: "phone", header: t("colPhone"), accessorKey: "phone" },
            { id: "relation", header: t("colRelation"), accessorKey: "relation" },
            {
              id: "students",
              header: t("colLinkedStudents"),
              accessorKey: "student_names",
            },
          ]}
        />
      )}
    </div>
  );
}
