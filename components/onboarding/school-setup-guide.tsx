"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { dismissSetupGuide, restoreSetupGuide } from "@/lib/actions/setup-guide";
import type { SetupGuideProgress } from "@/lib/schools/setup-guide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SchoolSetupGuideProps = {
  progress: SetupGuideProgress;
};

function CheckIcon({ done }: { done: boolean }) {
  if (done) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-700" />
  );
}

export function SchoolSetupGuide({ progress }: SchoolSetupGuideProps) {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (progress.dismissed && !progress.allComplete) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm dark:border-indigo-900 dark:bg-indigo-950/40">
        <p className="text-indigo-900 dark:text-indigo-100">
          {t("setupPaused", {
            completed: progress.completedCount,
            total: progress.totalCount,
          })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await restoreSetupGuide();
              router.refresh();
            })
          }
        >
          {t("resumeGuide")}
        </Button>
      </div>
    );
  }

  if (progress.dismissed || progress.allComplete) {
    return null;
  }

  const pct = Math.round((progress.completedCount / progress.totalCount) * 100);

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-white dark:border-indigo-900 dark:from-indigo-950/30 dark:to-slate-900">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{t("gettingStarted")}</CardTitle>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {t("guideDescription")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? tc("expand") : tc("collapse")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await dismissSetupGuide();
                  router.refresh();
                })
              }
            >
              {t("skipForNow")}
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>
              {t("progressComplete", {
                completed: progress.completedCount,
                total: progress.totalCount,
              })}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {progress.steps.map((step) => {
              const done = progress.completed[step.id];
              return (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      done
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
                    }`}
                  >
                    <CheckIcon done={done} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium ${
                          done
                            ? "text-emerald-800 line-through dark:text-emerald-200"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {step.title}
                      </p>
                      {!done && (
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                          {step.description}
                        </p>
                      )}
                    </div>
                    {!done && (
                      <span className="shrink-0 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {t("startStep")}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
