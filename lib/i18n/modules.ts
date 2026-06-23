import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Globe,
  GraduationCap,
  MessageSquare,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

export type PlatformModule = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  desc: string;
  span?: string;
  showOnHomepageGrid?: boolean;
  icon: LucideIcon;
  iconClassName: string;
  highlights: string[];
  whoItsFor: string[];
  kenyaContext?: string;
};

type ModuleTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;

const MODULE_ICONS: Record<
  string,
  { icon: LucideIcon; iconClassName: string; span?: string; showOnHomepageGrid?: boolean }
> = {
  academic: { icon: GraduationCap, iconClassName: "text-blue-500", span: "md:col-span-2" },
  finance: { icon: Wallet, iconClassName: "text-emerald-500", span: "md:col-span-1" },
  operations: { icon: Settings, iconClassName: "text-slate-500", span: "md:col-span-1" },
  analytics: { icon: BarChart3, iconClassName: "text-indigo-500", span: "md:col-span-2" },
  "school-websites": { icon: Globe, iconClassName: "text-amber-500", span: "md:col-span-2" },
  messaging: { icon: MessageSquare, iconClassName: "text-purple-500", span: "md:col-span-1" },
  "parent-student-portals": {
    icon: Users,
    iconClassName: "text-rose-500",
    showOnHomepageGrid: false,
  },
};

const MODULE_SLUGS = [
  "academic",
  "finance",
  "operations",
  "analytics",
  "school-websites",
  "messaging",
  "parent-student-portals",
] as const;

function slugToKey(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function getPlatformModules(t: ModuleTranslator): PlatformModule[] {
  return MODULE_SLUGS.map((slug) => {
    const key = slugToKey(slug);
    const meta = MODULE_ICONS[slug];
    const highlightCount = slug === "parent-student-portals" ? 6 : 6;

    return {
      slug,
      title: t(`${key}.title`),
      tagline: t(`${key}.tagline`),
      summary: t(`${key}.summary`),
      desc: t(`${key}.desc`),
      span: meta.span,
      showOnHomepageGrid: meta.showOnHomepageGrid,
      icon: meta.icon,
      iconClassName: meta.iconClassName,
      highlights: Array.from({ length: highlightCount }, (_, i) =>
        t(`${key}.highlights.${i}`)
      ),
      whoItsFor: [0, 1, 2].map((i) => t(`${key}.whoItsFor.${i}`)),
      kenyaContext: t(`${key}.kenyaContext`),
    };
  });
}

export function getHomepageCtaSections(t: ModuleTranslator) {
  return [
    { label: t("homepageCta.academic"), slug: "academic" },
    { label: t("homepageCta.finance"), slug: "finance" },
    { label: t("homepageCta.portals"), slug: "parent-student-portals" },
  ] as const;
}

export function getPlatformModule(
  slug: string,
  t: ModuleTranslator
): PlatformModule | undefined {
  return getPlatformModules(t).find((module) => module.slug === slug);
}
