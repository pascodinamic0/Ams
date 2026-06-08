"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Rocket, UserPlus, Users, Zap } from "lucide-react";

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
      <section className="relative pt-40 pb-24 overflow-hidden border-b border-slate-200/50 dark:border-slate-800/50">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
              <Zap className="h-4 w-4 fill-indigo-600 dark:fill-indigo-400" />
              Get started in minutes
            </span>
            <h1 className="mt-8 text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-7xl">
              Launch your school <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">on AMS today.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
              No setup fees. No long contracts. A complete digital ecosystem for your school,
              designed for the modern educational landscape in Africa.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
              >
                Create school account
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-5 text-lg font-bold text-slate-700 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Already have an account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
              The Onboarding Journey
            </h2>
            <p className="mt-6 text-xl text-slate-500 dark:text-slate-400">
              Simple, guided steps to get your school online.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, idx) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-4 -left-2 select-none text-7xl font-black leading-none text-indigo-600/35 dark:text-indigo-400/40 group-hover:text-indigo-600/50 dark:group-hover:text-indigo-400/55 transition-colors sm:text-8xl sm:-top-6 sm:-left-4"
                >
                  {s.number}
                </div>
                <div className="relative z-10 pt-10">
                  <div className="mb-6 h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
