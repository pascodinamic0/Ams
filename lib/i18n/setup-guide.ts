import type { SetupGuideStep, SetupGuideStepId } from "@/lib/schools/setup-guide";

type SetupGuideTranslator = (key: string) => string;

const STEP_IDS: SetupGuideStepId[] = [
  "website",
  "team",
  "subjects",
  "classes",
  "students",
  "timetable",
  "publish",
];

const STEP_HREFS: Record<SetupGuideStepId, string> = {
  website: "/academic/website",
  team: "/academic/team",
  subjects: "/academic/subjects",
  classes: "/academic/classes",
  students: "/academic/students/new",
  timetable: "/academic/timetable",
  publish: "/academic/website",
};

export function getSetupGuideSteps(t: SetupGuideTranslator): SetupGuideStep[] {
  return STEP_IDS.map((id) => ({
    id,
    title: t(`steps.${id}.title`),
    description: t(`steps.${id}.description`),
    href: STEP_HREFS[id],
  }));
}
