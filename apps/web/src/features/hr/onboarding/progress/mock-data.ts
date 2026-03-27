import type { OnboardingMember, ProgressSummaryStat } from "@/features/hr/onboarding/progress/types";

export const progressSummaryStats: ProgressSummaryStat[] = [
  { id: "in-progress", label: "In Progress", value: "12" },
  { id: "completed", label: "Completed", value: "28" },
  { id: "overdue", label: "Overdue", value: "3" },
];

export const onboardingMembers: OnboardingMember[] = [
  {
    id: "m-1",
    name: "Jessica Parker",
    role: "Full Stack Developer",
    department: "Technical Dept.",
    avatarText: "JP",
    completionPercent: 75,
    completedTasks: 6,
    totalTasks: 12,
    checklist: [
      { id: "m-1-c1", label: "Profile Created", done: true },
      { id: "m-1-c2", label: "Assets Assigned", done: true },
      { id: "m-1-c3", label: "System Access", done: false },
      { id: "m-1-c4", label: "Policies Signed", done: true },
      { id: "m-1-c5", label: "Access and Credential", done: true },
      { id: "m-1-c6", label: "System Access", done: false },
      { id: "m-1-c7", label: "Access and Credential", done: true },
      { id: "m-1-c8", label: "System Access", done: false },
      { id: "m-1-c9", label: "Profile Created", done: true },
    ],
  },
  {
    id: "m-2",
    name: "Eric Dawson",
    role: "Recruiter",
    department: "People Operations",
    avatarText: "ED",
    completionPercent: 58,
    completedTasks: 7,
    totalTasks: 12,
    checklist: [
      { id: "m-2-c1", label: "Contract signed", done: true },
      { id: "m-2-c2", label: "System access", done: true },
      { id: "m-2-c3", label: "Compensation setup", done: true },
      { id: "m-2-c4", label: "Manager orientation", done: false },
      { id: "m-2-c5", label: "Training plan", done: false },
    ],
  },
];
