"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { approveRelease, dismissRelease } from "@/lib/actions/releases";
import { toast } from "@/lib/toast";
import type { ProductRelease } from "@/lib/db/releases";

export function ReleaseQueue({
  releases,
  canManage,
  emptyHint,
}: {
  releases: ProductRelease[];
  canManage: boolean;
  emptyHint?: string;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function decide(id: string, action: "approve" | "dismiss") {
    setPendingId(id);
    const result =
      action === "approve" ? await approveRelease(id) : await dismissRelease(id);
    setPendingId(null);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    if ("warning" in result && result.warning === "pr_left_open") {
      toast.success(t("releaseDismissedPrOpen"));
    } else {
      toast.success(action === "approve" ? t("releaseApproved") : t("releaseDismissed"));
    }
    router.refresh();
  }

  if (releases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 p-6 dark:border-stone-700">
        <p className="text-sm text-stone-500">{emptyHint ?? t("noReleasesWaiting")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {releases.map((release) => (
        <article
          key={release.id}
          className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {t(`releaseStatus.${release.status}`)}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-stone-900 dark:text-white">
                {release.feature_name}
              </h2>
              {release.gap_closed ? (
                <p className="mt-2 max-w-2xl text-sm text-stone-600 dark:text-stone-400">
                  {release.gap_closed}
                </p>
              ) : null}
            </div>
            {release.status === "awaiting" && canManage ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={pendingId === release.id}
                  onClick={() => decide(release.id, "approve")}
                >
                  {t("approveRelease")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingId === release.id}
                  onClick={() => decide(release.id, "dismiss")}
                >
                  {t("dismissRelease")}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {release.preview_url ? (
              <a
                href={release.preview_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {t("openPreview")}
              </a>
            ) : null}
            <a
              href={release.pr_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {t("openPullRequest")}
            </a>
            {release.video_url ? (
              <a
                href={release.video_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {t("watchWalkthrough")}
              </a>
            ) : null}
          </div>

          {release.status === "awaiting" ? (
            <p className="mt-3 text-xs text-stone-500">{t("approveReleaseHint")}</p>
          ) : null}

          {release.feature_key ? (
            <p className="mt-2 text-xs text-stone-500">
              {t("releaseFeatureKey", { key: release.feature_key })}
            </p>
          ) : null}

          {release.steps.length > 0 ? (
            <ol className="mt-4 space-y-4">
              {release.steps.map((step) => (
                <li key={`${release.id}-${step.letter}`} className="text-sm">
                  <p className="font-medium text-stone-800 dark:text-stone-200">
                    {step.letter}. {step.caption}
                  </p>
                  {step.screenshotUrl ? (
                    // Tour screenshots are stored on the public tours bucket.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={step.screenshotUrl}
                      alt={step.caption}
                      className="mt-2 max-h-64 rounded-md border border-stone-200 dark:border-stone-800"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </article>
      ))}
    </div>
  );
}
