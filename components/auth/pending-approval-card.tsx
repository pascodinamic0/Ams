"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/layout/sign-out-button";

type PendingApprovalCardProps = {
  schoolName: string;
  isSuspended?: boolean;
  emailConfirmationNote?: string | null;
  showSignOut?: boolean;
};

export function PendingApprovalCard({
  schoolName,
  isSuspended = false,
  emailConfirmationNote,
  showSignOut = true,
}: PendingApprovalCardProps) {
  const t = useTranslations("auth");

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950">
        <svg
          className="h-7 w-7 text-amber-600 dark:text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {isSuspended ? t("schoolAccessSuspended") : t("awaitingApproval")}
      </h1>

      <p className="mt-3 text-slate-600 dark:text-slate-400">
        {isSuspended
          ? t.rich("suspendedMessage", {
              schoolName: () => <strong>{schoolName}</strong>,
              productName: companyIdentity.productName,
            })
          : t.rich("pendingMessage", {
              schoolName: () => <strong>{schoolName}</strong>,
              productName: companyIdentity.productName,
            })}
      </p>

      {emailConfirmationNote && (
        <p className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
          {emailConfirmationNote}
        </p>
      )}

      {!isSuspended && (
        <ul className="mt-6 space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li>{t("reviewTimeline")}</li>
          <li>{t("afterApprovalHint")}</li>
        </ul>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {showSignOut ? (
          <>
            <SignOutButton />
            <Link href="/settings">
              <Button variant="outline">{t("accountSettings")}</Button>
            </Link>
          </>
        ) : (
          <Link href="/login">
            <Button>{t("signInLink")}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
