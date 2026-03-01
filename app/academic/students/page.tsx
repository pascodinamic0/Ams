import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudents } from "@/lib/db";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <Link href="/academic/students/new">
          <Button>Add Student</Button>
        </Link>
      </div>
      {students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Add your first student to get started"
          action={
            <Link href="/academic/students/new">
              <Button>Add Student</Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={students}
          columns={[
            { id: "student_id", header: "Student ID", accessorKey: "student_id", sortable: true },
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "class_name", header: "Class", accessorKey: "class_name" },
            { id: "guardian_name", header: "Guardian", accessorKey: "guardian_name" },
            { id: "status", header: "Status", accessorKey: "status" },
          ]}
          keyExtractor={(row) => (row as { id: string }).id}
        />
      )}
    </div>
  );
}
