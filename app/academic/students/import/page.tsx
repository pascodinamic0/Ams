import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getClasses } from "@/lib/db";
import { StudentImportForm } from "./student-import-form";

export default async function StudentImportPage() {
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const schoolId = profile?.school_id ?? "";

  if (!branchId || !schoolId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Import students</h1>
        <EmptyState
          title="School context required"
          description="Assign a school and branch to your profile before importing students."
        />
        <Link href="/academic/students">
          <Button variant="outline">Back to students</Button>
        </Link>
      </div>
    );
  }

  const classes = await getClasses(branchId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import students</h1>
        <p className="mt-1 text-sm text-stone-500">
          Upload a CSV file to bulk-create students for your branch.
        </p>
      </div>

      <StudentImportForm
        schoolId={schoolId}
        branchId={branchId}
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
