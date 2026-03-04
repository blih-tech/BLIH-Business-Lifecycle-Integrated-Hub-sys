export type ActiveJobPriority = "high" | "medium" | "low";

export type JobDetailSection = {
  id: string;
  title: string;
  items: string[];
};

export type JobApplicant = {
  id: string;
  fullName: string;
  phone: string;
  appliedAt: string;
  yearsOfExperience: string;
  salaryExpectation: string;
  status: "new" | "reviewed";
};

export type JobAnalyticsPoint = {
  label: string;
  value: number;
};

export type TopMatchCandidate = {
  fullName: string;
  phone: string;
  experience: string;
  salaryExpectation: string;
  canStart: string;
  matchScore: number;
};

export type PipelineStats = {
  total: number;
  interviewed: number;
  shortlist: number;
  rejected: number;
};

export type ActiveJobItem = {
  id: string;
  title: string;
  levelTag?: string;
  statusLabel: string;
  department: string;
  employmentType: string;
  openings: number;
  applicantsCount: number;
  viewsCount: number;
  postedAt: string;
  closesAt: string;
  priority: ActiveJobPriority;
  summary: string;
  keyResponsibilities: string[];
  requirements: string[];
  benefits: string[];
  applicants: JobApplicant[];
  analytics: JobAnalyticsPoint[];
  topMatch: TopMatchCandidate;
  pipelineStats: PipelineStats;
  applicationFrequency: { month: string; applications: number }[];
  salaryDistribution: { range: string; value: number }[];
  genderDistribution: { name: string; value: number; fill: string }[];
  experienceDistribution: { range: string; value: number; fill: string }[];
};
