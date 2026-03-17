export type ProgressSummaryStat = {
  id: string;
  label: string;
  value: string;
};

export type OnboardingChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type OnboardingMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarText: string;
  completionPercent: number;
  completedTasks: number;
  totalTasks: number;
  checklist: OnboardingChecklistItem[];
};
