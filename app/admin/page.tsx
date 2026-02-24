import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { CardSkeletonGrid } from "@/components/ui/card-skeleton";

async function getDashboardData() {
  return {
    schools: 0,
    users: 0,
    students: 0,
    usersByRole: [{ name: "Admin", value: 0 }],
    schoolsByStatus: [{ name: "Active", value: 0 }],
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.schools}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.users}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.students}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          data={data.usersByRole}
          type="bar"
          xKey="name"
          yKey="value"
          title="Users by role"
        />
        <Chart
          data={data.schoolsByStatus}
          type="pie"
          dataKey="value"
          nameKey="name"
          title="Schools by status"
        />
      </div>
    </div>
  );
}
