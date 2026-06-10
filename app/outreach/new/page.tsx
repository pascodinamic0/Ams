import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "./campaign-form";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let schoolId = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single();
    schoolId = profile?.school_id ?? "";
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Campaign</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compose a message and send it to parents via WhatsApp, SMS, or in-app notification.
        </p>
      </div>
      <CampaignForm schoolId={schoolId} />
    </div>
  );
}
