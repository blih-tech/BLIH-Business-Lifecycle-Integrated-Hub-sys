import type { OkrItem, OkrSummaryStat } from "@/features/hr/performance/okrs/types";

export const okrSummaryStats: OkrSummaryStat[] = [
  { id: "total", label: "Total OKRs", value: "5", icon: "target" },
  { id: "avg", label: "Avg Completion", value: "87%", icon: "trending-up" },
  { id: "on-track", label: "On Track", value: "5", icon: "target" },
  { id: "at-risk", label: "At Risk", value: "0", icon: "target" },
];

const sharedKeyImpacts = [
  "30% reduction in time-to-market for new features",
  "Improved developer productivity by 25%",
  "Enhanced product quality with automated testing",
  "Increased user satisfaction ratings by 15%",
  "Reduced operational costs by 20% through efficiency improvements",
  "Streamlined onboarding process, cutting training time in half",
  "Boosted collaboration across teams leading to 30% faster project delivery",
];

export const okrItems: OkrItem[] = [
  {
    id: "okr-1",
    department: "Engineering",
    status: "On Track",
    title: "Accelerate Product Development Velocity",
    owner: "John Smith",
    dateRange: "2024-01-01 - 2024-03-31",
    overallScore: 88,
    expanded: true,
    keyResults: [
      { id: "kr-1", label: "Reduce deployment time from 2 days to 4 hours", value: 85 },
      { id: "kr-2", label: "Increase automated test coverage to 90%", value: 78 },
      { id: "kr-3", label: "Launch 3 major features per quarter", value: 100 },
    ],
    keyImpacts: sharedKeyImpacts,
    aiSummary:
      "Engineering team is on track to exceed deployment velocity targets. Exceptional progress on feature delivery, though test coverage needs attention in the final weeks.",
  },
  {
    id: "okr-2",
    department: "Engineering",
    status: "On Track",
    title: "Enable Data-Driven Decision Making",
    owner: "John Smith",
    dateRange: "2024-01-01 - 2024-03-31",
    overallScore: 78,
    keyResults: [],
    keyImpacts: [],
    aiSummary: "",
  },
  {
    id: "okr-3",
    department: "Engineering",
    status: "On Track",
    title: "Accelerate Product Development Velocity",
    owner: "John Smith",
    dateRange: "2024-01-01 - 2024-03-31",
    overallScore: 78,
    keyResults: [],
    keyImpacts: [],
    aiSummary: "",
  },
  {
    id: "okr-4",
    department: "Engineering",
    status: "On Track",
    title: "Accelerate Product Development Velocity",
    owner: "John Smith",
    dateRange: "2024-01-01 - 2024-03-31",
    overallScore: 78,
    keyResults: [],
    keyImpacts: [],
    aiSummary: "",
  },
  {
    id: "okr-5",
    department: "Engineering",
    status: "On Track",
    title: "Drive Revenue Growth and Customer Acquisition",
    owner: "John Smith",
    dateRange: "2024-01-01 - 2024-03-31",
    overallScore: 78,
    keyResults: [],
    keyImpacts: [],
    aiSummary: "",
  },
];
