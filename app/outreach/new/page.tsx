import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "./campaign-form";

export default async function NewCampaignPage() {
  const t = await getTranslations("outreach");
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
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("newCampaign")}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {t("composeSubtitle")}
        </p>
      </div>
      <CampaignForm schoolId={schoolId} />
    </div>
  );
}
