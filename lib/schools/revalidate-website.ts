import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function revalidateSchoolWebsiteByBranch(branchId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("branches")
    .select("schools(slug)")
    .eq("id", branchId)
    .single();

  const schools = data?.schools as { slug: string } | { slug: string }[] | null;
  const school = Array.isArray(schools) ? schools[0] : schools;
  const slug = school?.slug;
  if (!slug) return;

  revalidatePath(`/schools/${slug}`);
  revalidatePath(`/schools/${slug}/events`);
  revalidatePath(`/schools/${slug}/enroll`);
  revalidatePath(`/schools/${slug}/admissions`);
}

export async function revalidateSchoolWebsiteBySchoolId(schoolId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("slug").eq("id", schoolId).single();
  if (!data?.slug) return;

  revalidatePath(`/schools/${data.slug}`);
  revalidatePath(`/schools/${data.slug}/events`);
  revalidatePath(`/schools/${data.slug}/enroll`);
  revalidatePath(`/schools/${data.slug}/admissions`);
}
