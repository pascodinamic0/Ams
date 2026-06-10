import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOperationsDashboardData } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function OperationsDashboard() {
  const profile = await getCurrentProfile();
  const kpis = await getOperationsDashboardData({
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Operations Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Library titles</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.libraryTitles}</p>
            <p className="text-sm text-slate-500">{kpis.booksOnLoan} on loan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overdue loans</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{kpis.overdueLoans}</p>
            <p className="text-sm text-slate-500">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Staff</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.staffCount}</p>
            <p className="text-sm text-slate-500">Operations staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Transport routes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.transportRoutes}</p>
            <p className="text-sm text-slate-500">Active routes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming events</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.upcomingEvents}</p>
            <p className="text-sm text-slate-500">Next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/operations/library"><Button size="sm" className="w-full">Library</Button></Link>
            <Link href="/operations/transport"><Button size="sm" variant="ghost" className="w-full">Transport</Button></Link>
            <Link href="/operations/events"><Button size="sm" variant="ghost" className="w-full">Events</Button></Link>
            <Link href="/operations/staff"><Button size="sm" variant="ghost" className="w-full">Staff</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
