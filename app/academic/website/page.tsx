import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WebsiteEditorForm } from "@/components/schools/website-editor-form";
import { createClient } from "@/lib/supabase/server";
import { getSchoolById } from "@/lib/db";

export default async function AcademicWebsitePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-lg font-semibold">No school linked</h1>
        <p className="mt-2 text-sm">Your account is not linked to a school yet.</p>
      </div>
    );
  }

  const school = await getSchoolById(profile.school_id);

  if (!school) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="text-lg font-semibold">School not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Public Website</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Customize your school&apos;s public homepage, programs, gallery, and contact info.
          </p>
        </div>
        {school.public_site_enabled && (
          <a href={`/schools/${school.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">Preview site</Button>
          </a>
        )}
      </div>

      <WebsiteEditorForm school={school} />
    </div>
  );
}
