"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Rocket, UserPlus, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GetAccessCopy } from "@/lib/company/get-access-copy";

function OnboardingJourney({ copy }: { copy: GetAccessCopy }) {
  const steps = useMemo(
    () => [
      {
        number: "01",
        title: copy.step1Title,
        desc: copy.step1Desc,
        icon: <UserPlus className="h-5 w-5" />,
      },
      {
        number: "02",
        title: copy.step2Title,
        desc: copy.step2Desc,
        icon: <Zap className="h-5 w-5" />,
      },
      {
        number: "03",
        title: copy.step3Title,
        desc: copy.step3Desc,
        icon: <Users className="h-5 w-5" />,
      },
      {
        number: "04",
        title: copy.step4Title,
        desc: copy.step4Desc,
        icon: <Rocket className="h-5 w-5" />,
      },
    ],
    [copy]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const elements = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (elements.length === 0) return;

    const observers = elements.map((el, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(index);
        },
        { threshold: 0.55, rootMargin: "-15% 0px -15% 0px" }
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  return (
    <section className="py-16 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="font-display text-2xl tracking-wide text-stone-900 dark:text-white sm:text-4xl md:text-5xl">
            {copy.journeyTitle}
          </h2>
          <p className="mt-4 text-sm uppercase tracking-[0.16em] text-stone-500 dark:text-white/50 sm:mt-5 sm:text-base">
            {copy.journeySubtitle}
          </p>
        </div>

        <div className="relative mb-10 hidden lg:block">
          <div className="absolute left-[12.5%] right-[12.5%] top-6 h-px bg-stone-200 dark:bg-white/10" />
          <motion.div
            className="absolute left-[12.5%] top-6 h-px origin-left bg-amber-500"
            initial={false}
            animate={{
              width: `${(activeIndex / (steps.length - 1)) * 75}%`,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          <div className="grid grid-cols-4">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              const isComplete = index < activeIndex;

              return (
                <div key={step.number} className="flex justify-center">
                  <motion.button
                    type="button"
                    onClick={() => {
                      stepRefs.current[index]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    whileHover={{ scale: isActive ? 1.08 : 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                      isActive || isComplete
                        ? "border-amber-500 bg-amber-500 text-black"
                        : "border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-black text-stone-400 dark:text-white/40"
                    )}
                  >
                    {step.number}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={step.number}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06 }}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "cursor-pointer border p-5 transition-colors sm:p-6",
                  isActive
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/25"
                )}
              >
                <div
                  className={cn(
                    "mb-4 flex h-11 w-11 items-center justify-center rounded-full border",
                    isActive
                      ? "border-amber-500/50 text-amber-600 dark:text-amber-500"
                      : "border-stone-200 dark:border-white/15 text-stone-500 dark:text-white/50"
                  )}
                >
                  {step.icon}
                </div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">
                  {copy.stepLabels[index]}
                </p>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-white/50">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function GetAccessPageClient({ copy }: { copy: GetAccessCopy }) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black">
      <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden border-b border-stone-200 dark:border-white/10 px-4 pb-16 pt-28 sm:min-h-0 sm:block sm:px-0 sm:pb-24 sm:pt-36 md:pt-40">
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 h-64 w-64 rounded-full bg-stone-200/70 dark:bg-white/5 blur-[100px]" />

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-stone-600 dark:text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              {copy.heroBadge}
            </span>
            <h1 className="mt-5 font-display text-[1.85rem] leading-[1.2] tracking-wide text-stone-900 dark:text-white sm:mt-8 sm:text-5xl md:text-6xl">
              {copy.heroTitle}{" "}
              <span className="text-stone-600 dark:text-white/70">{copy.heroTitleHighlight}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm uppercase tracking-[0.14em] text-stone-500 dark:text-white/50 sm:mt-8 sm:text-base">
              {copy.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 dark:bg-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white dark:text-black transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:px-8"
              >
                {copy.createSchoolAccount}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 dark:border-white/35 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-900 dark:text-white transition-colors hover:border-stone-900 dark:hover:border-white hover:bg-stone-100 dark:hover:bg-white/5 sm:w-auto sm:px-8"
              >
                {copy.alreadyHaveAccount}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <OnboardingJourney copy={copy} />

      <section className="border-y border-stone-200 dark:border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl tracking-wide text-stone-900 dark:text-white sm:text-4xl md:text-5xl">
              {copy.includedTitle}
            </h2>
            <p className="mt-4 text-sm uppercase tracking-[0.16em] text-stone-500 dark:text-white/50 sm:mt-6 sm:text-base">
              {copy.includedSubtitle}
            </p>

            <div className="mt-12 grid gap-3 text-left sm:mt-14 sm:grid-cols-2">
              {copy.included.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 border border-stone-200 dark:border-white/10 px-5 py-4 transition-colors hover:border-stone-400 dark:hover:border-white/25"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
                  <span className="text-sm font-medium text-stone-600 dark:text-white/75 sm:text-base">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-14">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-stone-900 dark:bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white dark:text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {copy.createMySchoolAccount}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-white/35">
                {copy.joinRevolution}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
