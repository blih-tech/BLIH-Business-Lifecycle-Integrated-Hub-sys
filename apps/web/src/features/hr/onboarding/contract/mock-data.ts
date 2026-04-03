import type { ContractSummaryStat, EmploymentContract } from "@/features/hr/onboarding/contract/types";

export const contractSummaryStats: ContractSummaryStat[] = [
  { id: "active-contracts", label: "Active Contracts", value: "12", icon: "file" },
  { id: "offer-letters", label: "Offer Letters Sent", value: "28", icon: "mail" },
  { id: "on-probation", label: "On Probation", value: "45", icon: "clock" },
];

export const employmentContracts: EmploymentContract[] = [
  {
    id: "contract-1",
    name: "Jessica Parker",
    role: "Full Stack Developer",
    department: "Technical Dept.",
    avatarText: "JP",
    offerSentOn: "Dec 30, 2025",
    roleSummary:
      "Develop and maintain full-stack applications using React, Node.js, and cloud infrastructure. Lead technical initiatives and mentor junior developers.",
    responsibilities: [
      "Experience with digital marketing",
      "Strong analytical skills",
      "Team leadership experience",
    ],
    overview: {
      startDate: "Dec 30, 2025",
      workHours: "40 hrs/wk",
      probationPeriod: "3 months",
      salaryPayroll: "15,000",
    },
  },
  {
    id: "contract-2",
    name: "Jessica Parker",
    role: "Full Stack Developer",
    department: "Technical Dept.",
    avatarText: "JP",
    offerSentOn: "Jan 06, 2026",
    roleSummary:
      "Build and improve internal tools, maintain service reliability, and collaborate with product and design on delivery milestones.",
    responsibilities: [
      "Collaborate across engineering squads",
      "Document system decisions",
      "Support release quality checks",
    ],
    overview: {
      startDate: "Jan 10, 2026",
      workHours: "40 hrs/wk",
      probationPeriod: "3 months",
      salaryPayroll: "15,000",
    },
  },
  {
    id: "contract-3",
    name: "Jessica Parker",
    role: "Full Stack Developer",
    department: "Technical Dept.",
    avatarText: "JP",
    offerSentOn: "Jan 18, 2026",
    roleSummary:
      "Design scalable backend APIs and drive frontend delivery for onboarding workflows in collaboration with HR operations.",
    responsibilities: [
      "Define API contracts",
      "Mentor junior engineers",
      "Optimize deployment cycles",
    ],
    overview: {
      startDate: "Jan 22, 2026",
      workHours: "40 hrs/wk",
      probationPeriod: "3 months",
      salaryPayroll: "15,000",
    },
  },
];
