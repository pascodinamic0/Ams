export type SetupGuideStepId =
  | "website"
  | "team"
  | "subjects"
  | "classes"
  | "students"
  | "timetable"
  | "publish";

export type SetupGuideStep = {
  id: SetupGuideStepId;
  title: string;
  description: string;
  href: string;
};

export const SETUP_GUIDE_STEPS: SetupGuideStep[] = [
  {
    id: "website",
    title: "Set up your public website",
    description:
      "Add your story, contact details, and branding so families can learn about your school.",
    href: "/academic/website",
  },
  {
    id: "team",
    title: "Invite your team",
    description:
      "Add teachers, finance staff, and other roles so everyone has the right dashboard access.",
    href: "/academic/team",
  },
  {
    id: "subjects",
    title: "Create subjects",
    description: "Define the courses your school offers before building classes.",
    href: "/academic/subjects",
  },
  {
    id: "classes",
    title: "Create classes",
    description: "Organize students into grade levels or homerooms.",
    href: "/academic/classes",
  },
  {
    id: "students",
    title: "Enroll your first student",
    description:
      "Add a student record to start tracking attendance, grades, and fees.",
    href: "/academic/students/new",
  },
  {
    id: "timetable",
    title: "Build your timetable",
    description: "Assign subjects and teachers to class time slots.",
    href: "/academic/timetable",
  },
  {
    id: "publish",
    title: "Publish your website",
    description:
      "When you are ready, enable your public site so families can find and apply.",
    href: "/academic/website",
  },
];

export type SetupGuideProgress = {
  steps: SetupGuideStep[];
  completed: Record<SetupGuideStepId, boolean>;
  completedCount: number;
  totalCount: number;
  allComplete: boolean;
  dismissed: boolean;
};
