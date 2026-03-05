export type ReadyToPostDepartment = "technical" | "creative" | "digital_marketing";

export type ReadyToPostPriority = "high" | "medium" | "low";

export type ReadyToPostType = "Full-time" | "Part-time" | "Remote" | "Hybrid";

export type JobPostItem = {
  id: string;
  title: string;
  levelTag?: string;
  department: ReadyToPostDepartment;
  employmentType: ReadyToPostType;
  location: string;
  team: string;
  salaryRange: string;
  positions: number;
  jobOverview: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  priority: ReadyToPostPriority;
  requisitionId: string;
  dueDate: string;
  expectedDate: string;
};
