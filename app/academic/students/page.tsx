import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudents } from "@/lib/db";

export default async function StudentsPage() {
  const students = await getStudents();
  const tableData = students.map((row) => ({
    ...row,
    name_link: (
      <Link href={`/academic/students/${row.id}`} className="font-medium text-indigo-600 hover:underline">
        {String(row.name)}
      </Link>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex gap-2">
          <Link href="/academic/students/import">
            <Button variant="outline">Import CSV</Button>
          </Link>
          <Link href="/academic/students/new">
            <Button>Onboard student</Button>
          </Link>
        </div>
      </div>
      {students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Onboard your first student and guardian to get started"
          action={
            <Link href="/academic/students/new">
              <Button>Onboard student</Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "student_id", header: "Student ID", accessorKey: "student_id", sortable: true },
            { id: "name", header: "Name", accessorKey: "name_link", sortable: true },
            { id: "class_name", header: "Class", accessorKey: "class_name" },
            { id: "guardian_name", header: "Guardian", accessorKey: "guardian_name" },
            { id: "status", header: "Status", accessorKey: "status" },
          ]}
        />
      )}
    </div>
  );
}
