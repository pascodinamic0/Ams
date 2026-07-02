"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Rocket, UserPlus, Users, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { companyIdentity } from "@/lib/company/identity";

function OnboardingJourney() {
  const t = useTranslations("marketing.getAccess");
  const steps = useMemo(
    () => [
      {
        number: "01",
        title: t("step1Title"),
        desc: t("step1Desc"),
        icon: <UserPlus className="h-6 w-6" />,
      },
      {
        number: "02",
        title: t("step2Title"),
        desc: t("step2Desc"),
        icon: <Zap className="h-6 w-6 text-amber-500" />,
      },
      {
        number: "03",
        title: t("step3Title"),
        desc: t("step3Desc"),
        icon: <Users className="h-6 w-6 text-primary" />,
      },
      {
        number: "04",
        title: t("step4Title"),
        desc: t("step4Desc"),
        icon: <Rocket className="h-6 w-6 text-emerald-500" />,
      },
    ],
    [t]
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
    <section className="py-16 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-20">
          <h2 className="text-3xl font-black text-stone-900 dark:text-white md:text-5xl">
            {t("journeyTitle")}
          </h2>
          <p className="mt-4 text-base text-stone-500 dark:text-stone-400 sm:mt-6 sm:text-xl">
            {t("journeySubtitle")}
          </p>
        </div>

        <div className="relative mb-10 hidden lg:block">
          <div className="absolute left-[12.5%] right-[12.5%] top-6 h-0.5 bg-stone-200 dark:bg-stone-800" />
          <motion.div
            className="absolute left-[12.5%] top-6 h-0.5 origin-left bg-gradient-to-r from-teal-600 to-teal-500"
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
                    animate={{
                      scale: isActive ? 1.12 : 1,
                    }}
                    whileHover={{ scale: isActive ? 1.12 : 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-black shadow-sm transition-colors",
                      isActive
                        ? "border-primary-600 bg-primary text-white shadow-lg shadow-primary/30"
                        : isComplete
                          ? "border-primary-600 bg-primary text-white"
                          : "border-stone-200 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500"
                    )}
                  >
                    {step.number}
                    {isActive && (
                      <motion.span
                        layoutId="step-ring"
                        className="absolute inset-0 rounded-full border-2 border-primary-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.35 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      />
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-10">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const isComplete = index < activeIndex;
            const isLast = index === steps.length - 1;

            return (
              <motion.div
                key={step.number}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 120, damping: 18 }}
                animate={{
                  y: isActive ? -4 : 0,
                }}
                whileHover={{ y: -6 }}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "group relative cursor-pointer rounded-2xl border p-5 transition-shadow sm:p-6",
                  "flex gap-4 md:block md:gap-0",
                  isActive
                    ? "border-primary-500/40 bg-primary-light/50 shadow-lg shadow-primary/10 dark:border-primary-500/30 dark:bg-primary-light/20"
                    : "border-stone-200 bg-white hover:border-primary-300/50 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/50"
                )}
              >
                {!isLast && (
                  <div
                    aria-hidden
                    className="absolute left-[2.125rem] top-16 bottom-0 -mb-6 w-px bg-stone-200 dark:bg-stone-800 md:hidden"
                  >
                    <motion.div
                      className="w-full bg-gradient-to-b from-teal-600 to-teal-500"
                      initial={false}
                      animate={{ height: isComplete ? "100%" : isActive ? "50%" : "0%" }}
                      transition={{ type: "spring", stiffness: 120, damping: 22 }}
                    />
                  </div>
                )}

                <motion.div
                  animate={{
                    scale: isActive ? 1.08 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className={cn(
                    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black sm:h-12 sm:w-12 sm:text-sm md:hidden",
                    isActive || isComplete
                      ? "border-primary-600 bg-primary text-white shadow-md shadow-primary/25"
                      : "border-stone-200 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-900"
                  )}
                >
                  {step.number}
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-primary-400/80"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: [0.6, 0], scale: [1, 1.45] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </motion.div>

                <div className="relative z-10 min-w-0 flex-1 lg:pt-2">
                  <p className="mb-2 hidden text-xs font-black uppercase tracking-widest text-primary dark:text-primary md:block lg:hidden">
                    {t("stepLabel", { number: step.number })}
                  </p>
                  <motion.div
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      rotate: isActive ? [0, -4, 4, 0] : 0,
                    }}
                    transition={{
                      scale: { type: "spring", stiffness: 260, damping: 18 },
                      rotate: { duration: 0.5, ease: "easeInOut" },
                    }}
                    className={cn(
                      "mb-4 flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm sm:mb-6 sm:h-14 sm:w-14 sm:rounded-2xl sm:shadow-xl",
                      isActive
                        ? "border-primary-200 bg-white dark:border-primary-800 dark:bg-stone-900"
                        : "border-stone-100 bg-white dark:border-stone-800 dark:bg-stone-900"
                    )}
                  >
                    {step.icon}
                  </motion.div>
                  <h3
                    className={cn(
                      "text-lg font-bold sm:text-2xl",
                      isActive
                        ? "text-teal-950 dark:text-white"
                        : "text-stone-900 dark:text-white"
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400 sm:mt-4 sm:text-base sm:font-medium">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function GetAccessPage() {
  const t = useTranslations("marketing.getAccess");

  const included = [
    t("included1"),
    t("included2"),
    t("included3"),
    t("included4"),
    t("included5"),
    t("included6"),
    t("included7"),
    t("included8"),
  ];

  return (
    <div className="bg-white dark:bg-[#0c1222] min-h-screen">
      <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden border-b border-stone-200/50 px-4 pb-16 pt-28 sm:min-h-0 sm:block sm:px-0 sm:pb-24 sm:pt-36 md:pt-40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] sm:h-96 sm:w-96" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-purple-500/5 blur-[100px] sm:h-96 sm:w-96" />

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-xs font-bold text-primary dark:bg-primary-light/40 dark:text-primary sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
              <Zap className="h-3.5 w-3.5 shrink-0 fill-primary dark:fill-primary sm:h-4 sm:w-4" />
              {t("heroBadge")}
            </span>
            <h1 className="mt-5 text-[2rem] font-black leading-[1.1] tracking-tight text-stone-900 dark:text-white sm:mt-8 sm:text-5xl sm:leading-tight md:text-7xl">
              {t("heroTitle")}{" "}
              <span className="bg-gradient-to-r from-teal-600 to-teal-600 bg-clip-text text-transparent">
                {t("heroTitleHighlight", { productName: companyIdentity.productName })}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-500 dark:text-stone-400 sm:mt-8 sm:text-xl">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 md:gap-6">
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary active:scale-[0.98] sm:w-auto sm:px-10 sm:py-5 sm:text-lg sm:hover:scale-105 sm:active:scale-95"
              >
                {t("createSchoolAccount")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-6 py-4 text-base font-bold text-stone-700 transition-all hover:bg-stone-50 active:scale-[0.98] dark:border-stone-800 dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800 sm:w-auto sm:px-10 sm:py-5 sm:text-lg sm:active:scale-95"
              >
                {t("alreadyHaveAccount")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <OnboardingJourney />

      <section className="bg-stone-50 dark:bg-[#0c1222] py-32 border-y border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-stone-900 dark:text-white md:text-5xl">
              {t("includedTitle")}
            </h2>
            <p className="mt-6 text-xl text-stone-500 dark:text-stone-400">
              {t("includedSubtitle")}
            </p>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 text-left">
              {included.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 rounded-[1.5rem] border border-stone-200 bg-white px-8 py-6 dark:border-stone-800 dark:bg-stone-900 transition-all hover:shadow-lg hover:border-primary-500/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light dark:bg-primary-light">
                    <CheckCircle2 className="h-6 w-6 text-primary dark:text-primary" />
                  </div>
                  <span className="text-lg font-bold text-stone-700 dark:text-stone-300">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-20">
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-12 py-6 text-xl font-black text-white shadow-2xl shadow-primary/30 transition-all hover:bg-primary hover:scale-105 active:scale-95"
              >
                {t("createMySchoolAccount")}
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Link>
              <p className="mt-6 text-sm font-bold text-stone-400 uppercase tracking-widest">
                {t("joinRevolution")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
