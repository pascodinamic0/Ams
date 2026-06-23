import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAcademicDashboardData } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AcademicDashboard() {
  const profile = await getCurrentProfile();
  const data = await getAcademicDashboardData(profile?.school_id ?? undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Dashboard</h1>
      {data.totalStudents === 0 && data.classes === 0 && (
        <p className="text-sm text-slate-500">
          Your school starts empty — use the setup guide above to add subjects, classes, and students when you are ready.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Students</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{data.totalStudents}</p><p className="text-sm text-slate-500">{data.activeStudents} active</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Classes</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{data.classes}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Admissions</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{data.pendingAdmissions}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/academic/students/new"><Button size="sm" className="w-full">Add student</Button></Link>
            <Link href="/academic/admissions"><Button size="sm" variant="ghost" className="w-full">Review admissions</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
