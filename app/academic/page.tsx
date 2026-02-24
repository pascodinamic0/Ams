import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcademicDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>Students</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Classes</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Attendance</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0%</p></CardContent></Card>
      </div>
    </div>
  );
}
