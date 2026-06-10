import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSchoolById } from "@/lib/db";
import { SchoolStatusActions } from "../school-status-actions";
import { SchoolStatusBadge } from "../school-status-badge";
import { SchoolEditForm } from "./school-edit-form";

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolById(id);
  if (!school) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{school.name}</h1>
            <SchoolStatusBadge status={school.status ?? "pending"} />
          </div>
          <p className="text-sm text-zinc-500">Code: {school.code}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/schools">
            <Button variant="ghost">Back</Button>
          </Link>
          <Link href={`/admin/schools/${id}/website`}>
            <Button variant="outline">Website config</Button>
          </Link>
        </div>
      </div>
      <SchoolStatusActions
        schoolId={school.id}
        status={school.status ?? "pending"}
      />
      <SchoolEditForm school={school} />
    </div>
  );
}
