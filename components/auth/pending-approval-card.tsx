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
    <div className="w-full max-w-lg border border-white/10 bg-black p-8">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/40 text-amber-500">
        <svg
          className="h-7 w-7"
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

      <h1 className="font-display text-2xl tracking-wide text-white">
        {isSuspended ? t("schoolAccessSuspended") : t("awaitingApproval")}
      </h1>

      <p className="mt-3 text-white/55">
        {isSuspended
          ? t.rich("suspendedMessage", {
              schoolName: () => <strong className="text-white">{schoolName}</strong>,
              productName: companyIdentity.productName,
            })
          : t.rich("pendingMessage", {
              schoolName: () => <strong className="text-white">{schoolName}</strong>,
              productName: companyIdentity.productName,
            })}
      </p>

      {emailConfirmationNote && (
        <p className="mt-4 border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-white/70">
          {emailConfirmationNote}
        </p>
      )}

      {!isSuspended && (
        <ul className="mt-6 space-y-2 text-sm text-white/45">
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
