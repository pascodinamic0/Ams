import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getBranchAnalytics } from "@/lib/db";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function BranchAnalyticsPage() {
  const branches = await getBranchAnalytics();

  const chartData = branches.map((b) => ({
    name: b.name,
    students: b.students,
    revenue: Math.round(b.revenue),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Branch Performance</h1>
        <p className="mt-1 text-sm text-slate-500">Students, attendance, and revenue by branch</p>
      </div>

      {branches.length === 0 ? (
        <EmptyState title="No branches" description="Add branches to see performance analytics" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total branches</p>
                <p className="mt-2 text-3xl font-bold">{branches.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total students</p>
                <p className="mt-2 text-3xl font-bold">
                  {branches.reduce((sum, b) => sum + b.students, 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Avg attendance</p>
                <p className="mt-2 text-3xl font-bold">
                  {branches.length > 0
                    ? Math.round(
                        branches.reduce((sum, b) => sum + b.attendance_rate, 0) / branches.length
                      )
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
          </div>

          <Chart
            data={chartData}
            type="bar"
            xKey="name"
            yKeys={["students", "revenue"]}
            title="Students vs revenue by branch"
          />

          <DataTable
            data={branches.map((b) => ({
              ...b,
              revenue: formatCurrency(b.revenue),
              attendance_rate: `${b.attendance_rate}%`,
            }))}
            columns={[
              { id: "name", header: "Branch", accessorKey: "name", sortable: true },
              { id: "school_name", header: "School", accessorKey: "school_name", sortable: true },
              { id: "students", header: "Students", accessorKey: "students", sortable: true },
              { id: "attendance_rate", header: "Attendance", accessorKey: "attendance_rate", sortable: true },
              { id: "revenue", header: "Revenue", accessorKey: "revenue", sortable: true },
            ]}
          />
        </>
      )}
    </div>
  );
}
