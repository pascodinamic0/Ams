"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Rocket, UserPlus, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { companyIdentity } from "@/lib/company/identity";

const steps = [
  {
    number: "01",
    title: "Register your school",
    desc: "Create your school account with your name and admin email. Takes 60 seconds.",
    icon: <UserPlus className="h-6 w-6" />,
  },
  {
    number: "02",
    title: "Complete onboarding",
    desc: "A guided 4-step wizard walks you through domain, colors, and your public site template.",
    icon: <Zap className="h-6 w-6 text-amber-500" />,
  },
  {
    number: "03",
    title: "Invite your team",
    desc: "Add teachers, finance officers, and other admins — each gets a role-specific dashboard.",
    icon: <Users className="h-6 w-6 text-indigo-500" />,
  },
  {
    number: "04",
    title: "Go live",
    desc: "Your school portal and public website are ready. Parents and students can start using it today.",
    icon: <Rocket className="h-6 w-6 text-emerald-500" />,
  },
];

function OnboardingJourney() {
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
          <h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
            The Onboarding Journey
          </h2>
          <p className="mt-4 text-base text-slate-500 dark:text-slate-400 sm:mt-6 sm:text-xl">
            Simple, guided steps to get your school online.
          </p>
        </div>

        {/* Desktop progress rail */}
        <div className="relative mb-10 hidden lg:block">
          <div className="absolute left-[12.5%] right-[12.5%] top-6 h-0.5 bg-slate-200 dark:bg-slate-800" />
          <motion.div
            className="absolute left-[12.5%] top-6 h-0.5 origin-left bg-gradient-to-r from-indigo-600 to-purple-500"
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
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : isComplete
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                    )}
                  >
                    {step.number}
                    {isActive && (
                      <motion.span
                        layoutId="step-ring"
                        className="absolute inset-0 rounded-full border-2 border-indigo-400"
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
                    ? "border-indigo-500/40 bg-indigo-50/50 shadow-lg shadow-indigo-500/10 dark:border-indigo-500/30 dark:bg-indigo-950/20"
                    : "border-slate-200 bg-white hover:border-indigo-300/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
                )}
              >
                {/* Mobile / tablet timeline connector */}
                {!isLast && (
                  <div
                    aria-hidden
                    className="absolute left-[2.125rem] top-16 bottom-0 -mb-6 w-px bg-slate-200 dark:bg-slate-800 md:hidden"
                  >
                    <motion.div
                      className="w-full bg-gradient-to-b from-indigo-600 to-purple-500"
                      initial={false}
                      animate={{ height: isComplete ? "100%" : isActive ? "50%" : "0%" }}
                      transition={{ type: "spring", stiffness: 120, damping: 22 }}
                    />
                  </div>
                )}

                {/* Step badge — visible on mobile/tablet; hidden on lg (rail handles it) */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.08 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className={cn(
                    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black sm:h-12 sm:w-12 sm:text-sm md:hidden",
                    isActive || isComplete
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                  )}
                >
                  {step.number}
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-indigo-400/80"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: [0.6, 0], scale: [1, 1.45] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </motion.div>

                <div className="relative z-10 min-w-0 flex-1 lg:pt-2">
                  <p className="mb-2 hidden text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 md:block lg:hidden">
                    Step {step.number}
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
                        ? "border-indigo-200 bg-white dark:border-indigo-800 dark:bg-slate-900"
                        : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
                    )}
                  >
                    {step.icon}
                  </motion.div>
                  <h3
                    className={cn(
                      "text-lg font-bold sm:text-2xl",
                      isActive
                        ? "text-indigo-950 dark:text-white"
                        : "text-slate-900 dark:text-white"
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:mt-4 sm:text-base sm:font-medium">
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

const included = [
  "Admin & academic management",
  "Teacher portal (attendance, grades, assignments)",
  "Finance & invoicing",
  "Parent & student portals",
  "School public website with online admissions",
  "Analytics & reporting dashboards",
  "Real-time messaging",
  "Library & transport management",
];

export default function GetAccessPage() {
  return (
    <div className="bg-white dark:bg-[#0a0f1e] min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden border-b border-slate-200/50 px-4 pb-16 pt-28 sm:min-h-0 sm:block sm:px-0 sm:pb-24 sm:pt-36 md:pt-40">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px] sm:h-96 sm:w-96" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-purple-500/5 blur-[100px] sm:h-96 sm:w-96" />

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
              <Zap className="h-3.5 w-3.5 shrink-0 fill-indigo-600 dark:fill-indigo-400 sm:h-4 sm:w-4" />
              Get started in minutes
            </span>
            <h1 className="mt-5 text-[2rem] font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:mt-8 sm:text-5xl sm:leading-tight md:text-7xl">
              Launch your school{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                on {companyIdentity.productName} today.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:mt-8 sm:text-xl">
              No setup fees. No long contracts. A complete digital ecosystem for your school,
              built in Kenya for CBC schools, academies, and international programmes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 md:gap-6">
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98] sm:w-auto sm:px-10 sm:py-5 sm:text-lg sm:hover:scale-105 sm:active:scale-95"
              >
                Create school account
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 sm:w-auto sm:px-10 sm:py-5 sm:text-lg sm:active:scale-95"
              >
                Already have an account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <OnboardingJourney />

      {/* What's included */}
      <section className="bg-slate-50 dark:bg-[#060a16] py-32 border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
              Uncompromising Power
            </h2>
            <p className="mt-6 text-xl text-slate-500 dark:text-slate-400">
              One platform, all the tools your school needs from day one.
            </p>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 text-left">
              {included.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-lg hover:border-indigo-500/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950">
                    <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-20">
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 rounded-2xl bg-indigo-600 px-12 py-6 text-xl font-black text-white shadow-2xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
              >
                Create My School Account
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Link>
              <p className="mt-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
                Join the Educational Revolution
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
