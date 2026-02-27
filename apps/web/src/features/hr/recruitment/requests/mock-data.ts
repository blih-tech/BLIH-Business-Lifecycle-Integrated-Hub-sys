import type { JobRequestItem, RequestsStatItem } from "@/features/hr/recruitment/requests/types";

export const jobRequests: JobRequestItem[] = [
  {
    id: "jr-1",
    title: "Senior Software Engineer",
    department: "technical",
    priority: "high",
    positions: 3,
    employmentType: "Full-time",
    requestedAt: "Feb 7, 2025",
    primaryActionLabel: "Approve",
    secondaryActionLabel: "Justify",
  },
  {
    id: "jr-2",
    title: "Product Manager",
    department: "technical",
    priority: "medium",
    positions: 1,
    employmentType: "Full-time",
    requestedAt: "Feb 7, 2025",
    primaryActionLabel: "Approve",
    secondaryActionLabel: "Justify",
  },
  {
    id: "jr-3",
    title: "UI/UX Designer",
    department: "creative",
    priority: "low",
    positions: 2,
    employmentType: "Remote",
    requestedAt: "Feb 7, 2025",
    primaryActionLabel: "Approve",
    secondaryActionLabel: "Justify",
  },
  {
    id: "jr-4",
    title: "Data Analyst",
    department: "digital_marketing",
    priority: "low",
    positions: 2,
    employmentType: "Remote",
    requestedAt: "Feb 7, 2025",
    primaryActionLabel: "Approve",
    secondaryActionLabel: "Justify",
  },
];

export const requestStats: RequestsStatItem[] = [
  { id: "rs-1", label: "Pending Requests", value: "12", icon: "pending" },
  { id: "rs-2", label: "Approved This Month", value: "28", icon: "approved" },
  { id: "rs-3", label: "Total Open Positions", value: "45", icon: "open_positions" },
];

export const emptyRequestsMessage = "No jobs requested.";
