"use client";

import { useTranslations } from "next-intl";

export type LoginMethod = "email" | "phone";

export function LoginMethodTabs({
  value,
  onChange,
}: {
  value: LoginMethod;
  onChange: (method: LoginMethod) => void;
}) {
  const t = useTranslations("auth");

  const tabs: { id: LoginMethod; label: string }[] = [
    { id: "email", label: t("loginMethodEmail") },
    { id: "phone", label: t("loginMethodPhone") },
  ];

  return (
    <div
      className="mb-5 flex rounded-full border border-border p-1"
      role="tablist"
      aria-label={t("loginMethodLabel")}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
            value === tab.id
              ? "bg-mkt-inverse text-mkt-inverse-ink"
              : "text-muted hover:text-mkt-ink"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
