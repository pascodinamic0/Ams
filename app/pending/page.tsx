import { redirect } from "next/navigation";
import { PendingApprovalCard } from "@/components/auth/pending-approval-card";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { SchoolStatus } from "@/lib/db/schools";

export default async function PendingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role === "super_admin") {
    redirect("/admin");
  }

  let schoolName = "Your school";
  let schoolStatus: SchoolStatus = "pending";

  if (profile.school_id) {
    const supabase = await createClient();
    const { data: school } = await supabase
      .from("schools")
      .select("name, status")
      .eq("id", profile.school_id)
      .single();

    if (school) {
      schoolName = school.name;
      schoolStatus = (school.status as SchoolStatus) ?? "pending";
    }

    if (schoolStatus === "approved") {
      redirect("/academic");
    }
  }

  const isSuspended = schoolStatus === "suspended";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-[#0a0f1e]">
      <PendingApprovalCard schoolName={schoolName} isSuspended={isSuspended} />
    </div>
  );
}
