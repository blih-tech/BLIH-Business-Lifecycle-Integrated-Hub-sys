export type JobRequestPriority = "high" | "medium" | "low";

export type JobRequestDepartment = "technical" | "creative" | "digital_marketing";

export type JobRequestType = "Full-time" | "Part-time" | "Remote" | "Hybrid";

export type JobRequestItem = {
  id: string;
  title: string;
  department: JobRequestDepartment;
  priority: JobRequestPriority;
  positions: number;
  employmentType: JobRequestType;
  requestedAt: string;
  expectedStartDate: string;
  requestedBy: string;
  hiringManager: string;
  experienceLevel: string;
  justification: string;
  keySkills: string[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
};

export type RequestsStatIcon = "pending" | "approved" | "open_positions";

export type RequestsStatItem = {
  id: string;
  label: string;
  value: string;
  icon: RequestsStatIcon;
};
