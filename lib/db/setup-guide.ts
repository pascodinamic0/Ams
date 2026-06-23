import { createClient } from "@/lib/supabase/server";
import { parseWebsiteContent } from "@/lib/schools/website-content";
import {
  SETUP_GUIDE_STEPS,
  type SetupGuideProgress,
  type SetupGuideStepId,
} from "@/lib/schools/setup-guide";

async function getBranchIdsForSchool(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("branches")
    .select("id")
    .eq("school_id", schoolId);

  return (data ?? []).map((b) => b.id);
}

function isWebsiteConfigured(school: {
  about: string | null;
  logo_url: string | null;
  contact_phone: string | null;
  address: string | null;
  website_content: unknown;
}): boolean {
  const content = parseWebsiteContent(school.website_content);
  const hasAbout = Boolean(school.about?.trim());
  const hasContact =
    Boolean(school.contact_phone?.trim()) || Boolean(school.address?.trim());
  const hasBranding = Boolean(school.logo_url);
  const hasContent =
    (content.programs?.length ?? 0) > 0 ||
    (content.stats?.length ?? 0) > 0 ||
    (content.gallery?.length ?? 0) > 0 ||
    Boolean(content.hero_subtitle?.trim());

  return hasAbout && (hasContact || hasBranding || hasContent);
}

export async function getSetupGuideProgress(
  userId: string,
  schoolId: string
): Promise<SetupGuideProgress | null> {
  const supabase = await createClient();

  const [{ data: profile }, { data: school }, branchIds] = await Promise.all([
    supabase
      .from("profiles")
      .select("setup_guide_dismissed_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("schools")
      .select(
        "about, logo_url, contact_phone, address, website_content, public_site_enabled"
      )
      .eq("id", schoolId)
      .single(),
    getBranchIdsForSchool(supabase, schoolId),
  ]);

  if (!school) return null;

  const [
    teamResult,
    subjectsResult,
    classesResult,
    studentsResult,
    timetableResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .neq("id", userId),
    branchIds.length > 0
      ? supabase
          .from("subjects")
          .select("id", { count: "exact", head: true })
          .in("branch_id", branchIds)
      : Promise.resolve({ count: 0 }),
    branchIds.length > 0
      ? supabase
          .from("classes")
          .select("id", { count: "exact", head: true })
          .in("branch_id", branchIds)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId),
    branchIds.length > 0
      ? supabase
          .from("classes")
          .select("id")
          .in("branch_id", branchIds)
          .then(async ({ data: classes }) => {
            const classIds = (classes ?? []).map((c) => c.id);
            if (classIds.length === 0) return { count: 0 };
            return supabase
              .from("timetable_slots")
              .select("id", { count: "exact", head: true })
              .in("class_id", classIds);
          })
      : Promise.resolve({ count: 0 }),
  ]);

  const completed: Record<SetupGuideStepId, boolean> = {
    website: isWebsiteConfigured(school),
    team: (teamResult.count ?? 0) > 0,
    subjects: (subjectsResult.count ?? 0) > 0,
    classes: (classesResult.count ?? 0) > 0,
    students: (studentsResult.count ?? 0) > 0,
    timetable: (timetableResult.count ?? 0) > 0,
    publish: school.public_site_enabled === true,
  };

  const completedCount = SETUP_GUIDE_STEPS.filter((step) => completed[step.id]).length;

  return {
    steps: SETUP_GUIDE_STEPS,
    completed,
    completedCount,
    totalCount: SETUP_GUIDE_STEPS.length,
    allComplete: completedCount === SETUP_GUIDE_STEPS.length,
    dismissed: Boolean(profile?.setup_guide_dismissed_at),
  };
}
