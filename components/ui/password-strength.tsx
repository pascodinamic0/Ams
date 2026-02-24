"use client";

import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
  onStrengthChange?: (strength: "weak" | "medium" | "strong") => void;
}

function calcStrength(password: string): "weak" | "medium" | "strong" {
  if (!password) return "weak";
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  return "strong";
}

export function PasswordStrength({ password, onStrengthChange }: PasswordStrengthProps) {
  const { strength, feedback } = useMemo(() => {
    const s = calcStrength(password);
    onStrengthChange?.(s);
    const feedback: string[] = [];
    if (password.length > 0 && password.length < 8) feedback.push("At least 8 characters");
    if (password.length > 0 && !/[A-Z]/.test(password)) feedback.push("Add uppercase");
    if (password.length > 0 && !/[a-z]/.test(password)) feedback.push("Add lowercase");
    if (password.length > 0 && !/\d/.test(password)) feedback.push("Add number");
    if (password.length > 0 && !/[^a-zA-Z0-9]/.test(password)) feedback.push("Add special char");
    return { strength: s, feedback };
  }, [password, onStrengthChange]);

  const width = { weak: "33%", medium: "66%", strong: "100%" }[strength];
  const color = { weak: "bg-red-500", medium: "bg-amber-500", strong: "bg-green-500" }[strength];

  return (
    <div className="space-y-2">
      <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: password ? width : "0%" }}
        />
      </div>
      {password && feedback.length > 0 && (
        <p className="text-xs text-zinc-500">
          {strength === "strong" ? "Strong password" : feedback.join(", ")}
        </p>
      )}
    </div>
  );
}
