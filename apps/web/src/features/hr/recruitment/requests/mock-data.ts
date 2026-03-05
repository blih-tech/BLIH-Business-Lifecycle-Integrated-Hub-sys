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
    expectedStartDate: "Mar 15, 2025",
    requestedBy: "Alice Njeri",
    hiringManager: "Brian Otieno",
    experienceLevel: "Senior (5+ years)",
    justification:
      "Scale the backend and platform teams to support Q2 product launches and reduce delivery bottlenecks.",
    keySkills: ["TypeScript", "Node.js", "System Design", "AWS"],
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
    expectedStartDate: "Apr 1, 2025",
    requestedBy: "Mercy Wanjiku",
    hiringManager: "Daniel Kilonzo",
    experienceLevel: "Mid-level (3-5 years)",
    justification:
      "Own roadmap execution for HR automation initiatives and align product delivery across cross-functional teams.",
    keySkills: ["Product Strategy", "Stakeholder Management", "Agile", "Data Analysis"],
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
    expectedStartDate: "Apr 5, 2025",
    requestedBy: "Ian Mwangi",
    hiringManager: "Purity Atieno",
    experienceLevel: "Mid-level (2-4 years)",
    justification:
      "Increase design throughput for active product squads and improve consistency in design system adoption.",
    keySkills: ["Figma", "Interaction Design", "Design Systems", "User Research"],
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
    expectedStartDate: "Mar 28, 2025",
    requestedBy: "Kevin Kiptoo",
    hiringManager: "Grace Achieng",
    experienceLevel: "Mid-level (2-4 years)",
    justification:
      "Strengthen campaign reporting and attribution analysis to improve budget allocation and lead quality.",
    keySkills: ["SQL", "Excel", "Power BI", "Marketing Analytics"],
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
