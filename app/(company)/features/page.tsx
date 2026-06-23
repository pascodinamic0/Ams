"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { companyIdentity } from "@/lib/company/identity";
import {
  Building2,
  GraduationCap,
  School,
  Wallet,
  Settings,
  Users,
  BookOpen,
  BarChart3,
  Globe,
  ArrowRight,
  Check
} from "lucide-react";

const FEATURES = [
  {
    slug: "platform-admin",
    title: "Platform Admin",
    icon: <Building2 className="h-6 w-6" />,
    color: "indigo",
    items: ["Schools & branches", "Users & roles", "Audit logs", "Feature toggles"],
  },
  {
    slug: "academic",
    title: "Academic",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "blue",
    items: ["Students", "Guardians", "Admissions", "Classes & sections", "Timetable", "Curriculum"],
  },
  {
    slug: "teacher",
    title: "Teacher",
    icon: <Users className="h-6 w-6" />,
    color: "purple",
    items: ["Attendance", "Gradebook", "Assignments", "Exams", "Report cards", "Messages"],
  },
  {
    slug: "finance",
    title: "Finance",
    icon: <Wallet className="h-6 w-6" />,
    color: "emerald",
    items: ["Fee structure", "Invoices", "Payments", "Payroll", "Expenses", "Reports"],
  },
  {
    slug: "operations",
    title: "Operations",
    icon: <Settings className="h-6 w-6" />,
    color: "slate",
    items: ["Library", "Transport", "Events", "Staff/HR"],
  },
  {
    slug: "parent-portal",
    title: "Parent Portal",
    icon: <School className="h-6 w-6" />,
    color: "rose",
    items: ["Child performance", "Fees & payments", "Timetable", "Messages", "Events"],
  },
  {
    slug: "student-portal",
    title: "Student Portal",
    icon: <BookOpen className="h-6 w-6" />,
    color: "amber",
    items: ["Assignments", "Grades", "Library", "Messages", "Events"],
  },
  {
    slug: "analytics",
    title: "Analytics",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "cyan",
    items: ["Dashboards", "Branch performance", "Student analytics", "Attendance reports", "Financial reports"],
  },
  {
    slug: "school-websites",
    title: "School Websites",
    icon: <Globe className="h-6 w-6" />,
    color: "indigo",
    items: ["Branded homepage", "Online admissions", "3 templates (Modern, Classic, Minimal)"],
  },
];

function scrollToHashTarget() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const target = document.getElementById(hash);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function FeaturesPage() {
  useEffect(() => {
    const timeoutId = window.setTimeout(scrollToHashTarget, 150);
    window.addEventListener("hashchange", scrollToHashTarget);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("hashchange", scrollToHashTarget);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-[#0a0f1e] min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl">
            Everything you need to <br />
            <span className="text-indigo-600 dark:text-indigo-400">scale your school.</span>
          </h1>
          <p className="mt-8 text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
            A visual outline of every functionality in the {companyIdentity.productName} platform.
            All modules are fully integrated and designed for Kenyan schools — CBC-ready workflows, local fee structures, and parent communication that works on WhatsApp.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, idx) => (
            <motion.div
              key={f.slug}
              id={f.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group relative scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:border-indigo-500 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-400">
                  {f.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {f.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {f.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-base text-slate-600 dark:text-slate-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Check className="h-5 w-5 text-indigo-500" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 rounded-[3rem] bg-indigo-600 p-12 lg:p-20 text-center text-white"
        >
          <h2 className="text-3xl font-bold md:text-5xl">Ready to see it in action?</h2>
          <p className="mt-6 text-xl text-indigo-100 max-w-2xl mx-auto">
            Get personalized access for your school and explore all features in a live environment.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Link
              href="/get-access"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-indigo-900 transition-all hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border-2 border-indigo-400 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
            >
              Login to Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
