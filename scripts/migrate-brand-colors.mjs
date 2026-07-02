#!/usr/bin/env node
/**
 * Migrates hardcoded indigo/slate/zinc color classes to ShuleOS Horizon tokens.
 * Preserves semantic colors (red, green, emerald for status).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync(
  'rg -l "indigo-|slate-|zinc-" --glob "*.tsx" --glob "*.ts" .',
  { cwd: process.cwd(), encoding: "utf8" }
)
  .trim()
  .split("\n")
  .filter(Boolean);

const replacements = [
  // Indigo ? primary
  [/bg-indigo-600/g, "bg-primary"],
  [/bg-indigo-500/g, "bg-primary"],
  [/bg-indigo-700/g, "bg-primary-hover"],
  [/hover:bg-indigo-700/g, "hover:bg-primary-hover"],
  [/hover:bg-indigo-600/g, "hover:bg-primary-hover"],
  [/hover:bg-indigo-500/g, "hover:bg-primary-hover"],
  [/hover:bg-indigo-50/g, "hover:bg-primary-light"],
  [/bg-indigo-50/g, "bg-primary-light"],
  [/dark:bg-indigo-950\/50/g, "dark:bg-primary-light/50"],
  [/dark:bg-indigo-950/g, "dark:bg-primary-light"],
  [/dark:bg-indigo-900/g, "dark:bg-primary-light"],
  [/text-indigo-600/g, "text-primary"],
  [/text-indigo-700/g, "text-primary-hover"],
  [/text-indigo-500/g, "text-primary"],
  [/text-indigo-400/g, "text-primary"],
  [/text-indigo-300/g, "text-primary"],
  [/text-indigo-950/g, "text-teal-950"],
  [/text-indigo-100/g, "text-teal-100"],
  [/dark:text-indigo-400/g, "dark:text-primary"],
  [/dark:text-indigo-300/g, "dark:text-primary"],
  [/dark:hover:text-indigo-400/g, "dark:hover:text-primary"],
  [/hover:text-indigo-600/g, "hover:text-primary"],
  [/hover:text-indigo-700/g, "hover:text-primary-hover"],
  [/border-indigo-/g, "border-primary-"],
  [/ring-indigo-/g, "ring-primary-"],
  [/shadow-indigo-600\/20/g, "shadow-primary/20"],
  [/shadow-indigo-600\/30/g, "shadow-primary/30"],
  [/shadow-indigo-950\/20/g, "shadow-teal-950/20"],
  [/from-indigo-/g, "from-teal-"],
  [/via-indigo-/g, "via-teal-"],
  [/to-indigo-/g, "to-teal-"],
  [/to-purple-/g, "to-teal-"],
  [/from-purple-/g, "from-teal-"],
  [/via-purple-/g, "via-teal-"],
  [/bg-indigo-950\/25/g, "bg-teal-950/25"],
  [/selection:bg-indigo-500/g, "selection:bg-primary"],

  // Remaining indigo variants
  [/bg-indigo-950\/50/g, "bg-teal-950/50"],
  [/bg-indigo-950\/80/g, "bg-teal-950/80"],
  [/bg-indigo-900\/40/g, "bg-teal-900/40"],
  [/hover:bg-indigo-800\/60/g, "hover:bg-teal-800/60"],
  [/text-indigo-200/g, "text-teal-200"],
  [/bg-indigo-100/g, "bg-primary-light"],
  [/dark:hover:bg-indigo-950\/40/g, "dark:hover:bg-primary-light/40"],
  [/bg-indigo-950\/50/g, "bg-teal-950/50"],

  // Remaining slate variants
  [/from-slate-900/g, "from-stone-900"],
  [/border-slate-100/g, "border-stone-100"],
  [/dark:bg-slate-700/g, "dark:bg-stone-700"],
  [/shadow-slate-950\/10/g, "shadow-stone-950/10"],
  [/dark:to-\[#0a0f1e\]/g, "dark:to-[#0c1222]"],

  // Dark backgrounds
  [/dark:bg-\[#0a0f1e\]/g, "dark:bg-[#0c1222]"],
  [/dark:bg-\[#060a16\]/g, "dark:bg-[#0c1222]"],

  // Slate ? stone (neutral surfaces)
  [/bg-slate-50/g, "bg-stone-50"],
  [/bg-slate-100/g, "bg-stone-100"],
  [/bg-slate-200/g, "bg-stone-200"],
  [/bg-slate-800/g, "bg-stone-800"],
  [/bg-slate-900/g, "bg-stone-900"],
  [/bg-slate-950/g, "bg-stone-950"],
  [/hover:bg-slate-50/g, "hover:bg-stone-50"],
  [/hover:bg-slate-100/g, "hover:bg-stone-100"],
  [/hover:bg-slate-200/g, "hover:bg-stone-200"],
  [/hover:bg-slate-700/g, "hover:bg-stone-700"],
  [/hover:bg-slate-800/g, "hover:bg-stone-800"],
  [/hover:bg-slate-900/g, "hover:bg-stone-900"],
  [/dark:hover:bg-slate-800/g, "dark:hover:bg-stone-800"],
  [/dark:hover:bg-slate-900/g, "dark:hover:bg-stone-900"],
  [/dark:hover:bg-slate-700/g, "dark:hover:bg-stone-700"],
  [/text-slate-900/g, "text-stone-900"],
  [/text-slate-800/g, "text-stone-800"],
  [/text-slate-700/g, "text-stone-700"],
  [/text-slate-600/g, "text-stone-600"],
  [/text-slate-500/g, "text-stone-500"],
  [/text-slate-400/g, "text-stone-400"],
  [/text-slate-300/g, "text-stone-300"],
  [/text-slate-200/g, "text-stone-200"],
  [/text-slate-100/g, "text-stone-100"],
  [/dark:text-slate-100/g, "dark:text-stone-100"],
  [/dark:text-slate-200/g, "dark:text-stone-200"],
  [/dark:text-slate-300/g, "dark:text-stone-300"],
  [/dark:text-slate-400/g, "dark:text-stone-400"],
  [/hover:text-slate-900/g, "hover:text-stone-900"],
  [/hover:text-slate-600/g, "hover:text-stone-600"],
  [/dark:hover:text-white/g, "dark:hover:text-white"],
  [/border-slate-200/g, "border-stone-200"],
  [/border-slate-300/g, "border-stone-300"],
  [/border-slate-700/g, "border-stone-700"],
  [/border-slate-800/g, "border-stone-800"],
  [/dark:border-slate-800/g, "dark:border-stone-800"],
  [/dark:border-slate-700/g, "dark:border-stone-700"],
  [/border-slate-200\/50/g, "border-stone-200/50"],
  [/border-slate-800\/50/g, "border-stone-800/50"],
  [/border-slate-200\/70/g, "border-stone-200/70"],
  [/border-slate-800\/70/g, "border-stone-800/70"],
  [/shadow-slate-950\/20/g, "shadow-stone-950/20"],
  [/shadow-slate-950\/25/g, "shadow-stone-950/25"],
  [/shadow-slate-950\/5/g, "shadow-stone-950/5"],
  [/divide-slate-/g, "divide-stone-"],

  // Zinc ? stone (form leftovers)
  [/bg-zinc-50/g, "bg-stone-50"],
  [/bg-zinc-100/g, "bg-stone-100"],
  [/bg-zinc-200/g, "bg-stone-200"],
  [/bg-zinc-800/g, "bg-stone-800"],
  [/bg-zinc-900/g, "bg-stone-900"],
  [/bg-zinc-950/g, "bg-stone-950"],
  [/dark:bg-zinc-950/g, "dark:bg-stone-950"],
  [/dark:bg-zinc-900/g, "dark:bg-stone-900"],
  [/text-zinc-900/g, "text-stone-900"],
  [/text-zinc-700/g, "text-stone-700"],
  [/text-zinc-600/g, "text-stone-600"],
  [/text-zinc-500/g, "text-stone-500"],
  [/text-zinc-400/g, "text-stone-400"],
  [/text-zinc-300/g, "text-stone-300"],
  [/dark:text-zinc-100/g, "dark:text-stone-100"],
  [/dark:text-zinc-300/g, "dark:text-stone-300"],
  [/dark:text-zinc-400/g, "dark:text-stone-400"],
  [/border-zinc-200/g, "border-stone-200"],
  [/border-zinc-300/g, "border-stone-300"],
  [/border-zinc-700/g, "border-stone-700"],
  [/border-zinc-800/g, "border-stone-800"],
  [/dark:border-zinc-800/g, "dark:border-stone-800"],
  [/dark:border-zinc-700/g, "dark:border-stone-700"],
  [/dark:divide-zinc-800/g, "dark:divide-stone-800"],
  [/divide-zinc-200/g, "divide-stone-200"],
  [/hover:bg-zinc-100/g, "hover:bg-stone-100"],
  [/hover:bg-zinc-800/g, "hover:bg-stone-800"],
  [/dark:hover:bg-zinc-800/g, "dark:hover:bg-stone-800"],
  [/dark:hover:bg-zinc-900/g, "dark:hover:bg-stone-900"],
  [/hover:text-zinc-600/g, "hover:text-stone-600"],
  [/hover:text-zinc-700/g, "hover:text-stone-700"],
  [/dark:hover:text-zinc-300/g, "dark:hover:text-stone-300"],
  [/focus:ring-zinc-400/g, "focus:ring-primary"],
  [/ring-zinc-400/g, "ring-primary"],
  [/placeholder:text-zinc-400/g, "placeholder:text-stone-400"],
  [/dark:placeholder:text-zinc-500/g, "dark:placeholder:text-stone-500"],
];

let changed = 0;
for (const file of files) {
  let content = readFileSync(file, "utf8");
  const original = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    writeFileSync(file, content);
    changed++;
    console.log(`Updated ${file}`);
  }
}

console.log(`\nDone. ${changed} files updated.`);
