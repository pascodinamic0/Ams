import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PendingApprovalCard } from "@/components/auth/pending-approval-card";

type PageProps = {
  searchParams: Promise<{ email?: string; school?: string }>;
};

export default async function RegisterSuccessPage({ searchParams }: PageProps) {
  const t = await getTranslations("auth");
  const params = await searchParams;
  const schoolName = params.school?.trim() || t("defaultSchoolName");
  const email = params.email?.trim();

  const emailConfirmationNote = email
    ? t("registerSuccessEmailNote", { email })
    : t("registerSuccessEmailNoteGeneric");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <PendingApprovalCard
        schoolName={schoolName}
        emailConfirmationNote={emailConfirmationNote}
        showSignOut={false}
      />
      <p className="mt-6 text-center text-sm text-stone-400 dark:text-white/45">
        {t("registerWrongEmail")}{" "}
        <Link href="/register" className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
          {t("registerAgain")}
        </Link>
      </p>
    </div>
  );
}
