import type { ApplicationFormValues } from "@/features/hr/recruitment/requests/application-form-schema";
import type { CreateRequestFormValues } from "@/features/hr/recruitment/requests/form-schema";
import type { JobDetailsFormValues } from "@/features/hr/recruitment/requests/job-details-schema";

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

export type SubmittedJobDetails = Omit<
  JobDetailsFormValues,
  "keyResponsibilities" | "requirements" | "preferredSkills" | "benefits"
> & {
  keyResponsibilities: string[];
  requirements: string[];
  preferredSkills: string[];
  benefits: string[];
};

export type SubmittedJobRequest = {
  requestForm: CreateRequestFormValues;
  jobDetailsForm: SubmittedJobDetails;
  applicationForm: ApplicationFormValues;
};

export type ApprovalProgressState = "pending" | "approved" | "requested_review" | "rejected";

export type ApprovalStep = {
  status: ApprovalProgressState;
  justification?: string;
};

export type FullJobRequest = SubmittedJobRequest & {
  status: "active" | "by_me" | "closed" | "posted";
  progress: {
    jm: ApprovalStep;
    hr: ApprovalStep;
    finance: ApprovalStep;
  };
};
