"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  Settings,
  BarChart3,
  MessageSquare,
  Globe,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  {
    badge: "Administrators & Directors",
    title: "Run your entire school from one place",
    description:
      "Get a comprehensive overview of your school — finances, attendance, student performance, and staff — all in one dashboard. Generate reports, manage enrollments, and communicate with parents in a single click.",
    cta: "Explore admin features",
    href: "/features#admin",
    image: "/images/role_admin.png",
    icon: <Users className="h-6 w-6" />,
    color: "indigo"
  },
  {
    badge: "Teachers & Educators",
    title: "Spend less time on admin, more on teaching",
    description:
      "Take attendance, enter grades, create assignments, and generate report cards — all from your dashboard. Reuse content across classes and send targeted messages to students and parents.",
    cta: "Explore teacher features",
    href: "/features#teacher",
    image: "/images/role_teacher.png",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "blue"
  },
  {
    badge: "Parents & Students",
    title: "Stay connected to school, always",
    description:
      "Parents track grades, fees, timetables, and assignments in real time. Students submit work, view their schedule, and message teachers — from any device, anywhere.",
    cta: "Explore parent & student features",
    href: "/features#parent",
    image: "/images/role_parent.png",
    icon: <Users className="h-6 w-6" />,
    color: "indigo"
  },
];

const modules = [
  {
    icon: <GraduationCap className="h-6 w-6 text-blue-500" />,
    title: "Academic",
    desc: "Students, classes, timetable, attendance, grades, report cards",
    span: "md:col-span-2"
  },
  {
    icon: <Wallet className="h-6 w-6 text-emerald-500" />,
    title: "Finance",
    desc: "Fees, invoices, payments, payroll, tracking",
    span: "md:col-span-1"
  },
  {
    icon: <Settings className="h-6 w-6 text-slate-500" />,
    title: "Operations",
    desc: "Library, transport, events, staff",
    span: "md:col-span-1"
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
    title: "Analytics",
    desc: "Dashboards, branch comparison, attendance & finance reports",
    span: "md:col-span-2"
  },
  {
    icon: <Globe className="h-6 w-6 text-amber-500" />,
    title: "School Websites",
    desc: "Branded sites with online admissions",
    span: "md:col-span-2"
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
    title: "Messaging",
    desc: "Real-time communication for everyone",
    span: "md:col-span-1"
  },
];

const stats = [
  { value: "8", label: "User roles" },
  { value: "76+", label: "Pages & Flows" },
  { value: "1", label: "Unified Platform" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0f1e]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_bg.png"
            alt="Hero Background"
            fill
            className="object-cover opacity-60 dark:opacity-40 grayscale-[0.2] contrast-[1.1]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-indigo-950/60 to-white dark:to-[#0a0f1e]" />

          {/* Animated Glows */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              The operating system for schools
            </span>
            <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl">
              Manage every part <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                of your school
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-indigo-100/70">
              A cinematic one-stop solution to manage, track, and automate your entire educational ecosystem.
              Real-time dashboards designed for African schools.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/get-access"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-white px-8 py-4 text-base font-bold text-indigo-950 transition-all hover:bg-indigo-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Get access as a school
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/features"
                className="rounded-2xl border border-indigo-400/40 bg-indigo-900/40 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-indigo-800/60"
              >
                See all features
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-indigo-400/10 pt-12">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl font-black text-white">{s.value}</p>
                  <p className="mt-2 text-sm font-medium uppercase tracking-widest text-indigo-400">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles Section - Visual Uplift */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-24 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-6xl">
              Built for everyone
            </h2>
            <p className="mt-6 text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Tailored experiences for every stakeholder, ensuring engagement and efficiency across the board.
            </p>
          </div>

          <div className="space-y-32">
            {roles.map((role, i) => (
              <motion.div
                key={role.badge}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={cn(
                  "flex flex-col gap-12 lg:gap-20 items-center",
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                )}
              >
                {/* Visual Side */}
                <div className="flex-1 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl transition-all group-hover:blur-3xl" />
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <Image
                      src={role.image}
                      alt={role.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Floating Elements (Decorative) */}
                  <div className={cn(
                    "absolute -bottom-6 flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-xl border border-slate-100 dark:border-slate-800",
                    i % 2 === 0 ? "-right-6" : "-left-6"
                  )}>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Active User Presence</p>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center gap-3 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide">
                    {role.icon}
                    {role.badge}
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-5xl leading-tight">
                    {role.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                    {role.description}
                  </p>
                  <ul className="space-y-4">
                    {[1, 2, 3].map((_, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                        <span className="font-medium">Streamlined workflow optimization for {role.badge}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <Link
                      href={role.href}
                      className="inline-flex items-center gap-2 text-lg font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group"
                    >
                      {role.cta}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Modules */}
      <section className="py-32 bg-slate-50 dark:bg-[#060a16] border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
              Powerful Modules
            </h2>
            <p className="mt-6 text-xl text-slate-500 dark:text-slate-400">
              A comprehensive toolkit designed to manage every facet of Modern African Education.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {modules.map((m, idx) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className={cn(
                  "relative group overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-all hover:shadow-2xl hover:border-indigo-500/50",
                  m.span
                )}
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="mb-6 h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors group-hover:bg-indigo-500/10">
                      {m.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">
                      {m.desc}
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="h-1 w-12 bg-indigo-500 rounded-full transition-all group-hover:w-full opacity-30" />
                  </div>
                </div>

                {/* Decorative Background Pattern */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Premium Look */}
      <section className="relative py-32 overflow-hidden bg-indigo-950">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div
            className="h-full w-full"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h2 className="text-5xl font-black text-white md:text-7xl">
              Ready to elevate <br /> your school?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-indigo-200/80">
              Join thousands of schools across Africa that are digitizing their operations with AMS.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <Link
                href="/get-access"
                className="rounded-2xl bg-white px-10 py-5 text-lg font-bold text-indigo-950 shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95"
              >
                Get Started Today
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-white/10 pt-12 text-sm font-semibold uppercase tracking-widest text-indigo-300/70">
              <span>Academic management</span>
              <span className="hidden sm:inline text-indigo-500/40">|</span>
              <span>Fee &amp; finance tracking</span>
              <span className="hidden sm:inline text-indigo-500/40">|</span>
              <span>Parent &amp; student portals</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
