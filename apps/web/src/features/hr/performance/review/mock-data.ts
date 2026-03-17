import type { ReviewRow } from "@/features/hr/performance/review/types";

export const reviewRows: ReviewRow[] = [
  {
    id: "review-1",
    name: "John Smith",
    initials: "JS",
    department: "Engineering",
    leaveType: "Annual",
    gender: "Male",
    resultGroup: "Top",
    kpi: 88,
    okr: 90,
    score: 4.4,
    status: "completed",
  },
  {
    id: "review-2",
    name: "Sarah Johnson",
    initials: "SJ",
    department: "Marketing",
    leaveType: "Sick",
    gender: "Female",
    resultGroup: "Top",
    kpi: 95,
    okr: 92,
    score: 4.7,
    status: "completed",
  },
  {
    id: "review-3",
    name: "Mike Brown",
    initials: "MB",
    department: "Design",
    leaveType: "Emergency",
    gender: "Male",
    resultGroup: "Middle",
    kpi: 78,
    okr: 75,
    score: 3.9,
    status: "in-progress",
  },
];

export const departmentOptions = ["all", "Engineering", "Marketing", "Design"] as const;
export const leaveTypeOptions = ["all", "Annual", "Sick", "Emergency"] as const;
export const statusOptions = ["all", "completed", "in-progress"] as const;
export const genderOptions = ["all", "Male", "Female"] as const;
export const resultGroupOptions = ["all", "Top", "Middle", "Needs Improvement"] as const;
