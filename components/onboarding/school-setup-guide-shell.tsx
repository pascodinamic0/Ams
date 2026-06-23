import { getCurrentProfile } from "@/lib/auth/session";
import { getSetupGuideProgress } from "@/lib/db/setup-guide";
import { SchoolSetupGuide } from "./school-setup-guide";

export async function SchoolSetupGuideShell() {
  const profile = await getCurrentProfile();

  if (!profile?.school_id || profile.role !== "academic_admin") {
    return null;
  }

  const progress = await getSetupGuideProgress(profile.id, profile.school_id);
  if (!progress) return null;

  return <SchoolSetupGuide progress={progress} />;
}
