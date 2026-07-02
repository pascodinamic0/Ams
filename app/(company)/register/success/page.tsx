import Link from "next/link";
import { PendingApprovalCard } from "@/components/auth/pending-approval-card";

type PageProps = {
  searchParams: Promise<{ email?: string; school?: string }>;
};

export default async function RegisterSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const schoolName = params.school?.trim() || "Your school";
  const email = params.email?.trim();

  const emailConfirmationNote = email
    ? `We sent a confirmation link to ${email}. Confirm your email, then sign in to check your approval status.`
    : "Check your email for a confirmation link, then sign in to check your approval status.";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-stone-50 px-4 py-12 dark:bg-[#0c1222]">
      <PendingApprovalCard
        schoolName={schoolName}
        emailConfirmationNote={emailConfirmationNote}
        showSignOut={false}
      />
      <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
        Wrong email?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary-hover dark:text-primary"
        >
          Register again
        </Link>
      </p>
    </div>
  );
}
