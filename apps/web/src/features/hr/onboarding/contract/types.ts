import type { ProgressSummaryStat } from "@/features/hr/onboarding/progress/types";

export type ContractSummaryStat = ProgressSummaryStat & {
  icon: "file" | "mail" | "clock";
};

export type EmploymentContract = {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarText: string;
  offerSentOn: string;
  roleSummary: string;
  responsibilities: string[];
  overview: {
    startDate: string;
    workHours: string;
    probationPeriod: string;
    salaryPayroll: string;
  };
};
