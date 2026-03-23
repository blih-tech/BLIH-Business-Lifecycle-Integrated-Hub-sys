import type { ApplicationFormValues } from "@/features/hr/recruitment/requests/application-form-schema";
import type { CreateRequestFormValues } from "@/features/hr/recruitment/requests/form-schema";
import type { JobDetailsFormValues } from "@/features/hr/recruitment/requests/job-details-schema";

export type JobRequestPriority = "high" | "medium" | "low";
export type JobRequestDepartment = "technical" | "creative" | "digital_marketing";
export type JobRequestType = "Full-time" | "Part-time" | "Remote" | "Hybrid";

export type SubmittedJobRequest = {
  requestForm: CreateRequestFormValues & {
    createdDate?: string;
    openings?: string;
  };
  jobDetailsForm: JobDetailsFormValues;
  applicationForm: ApplicationFormValues;
};

export type ApprovalProgressState = "pending" | "approved" | "requested_review" | "rejected";

export type ApprovalStep = {
  status: ApprovalProgressState;
  justification?: string;
};

export type FullJobRequest = SubmittedJobRequest & {
  jobId?: string;
  status: "active" | "by_me" | "closed" | "posted";
  progress: {
    jm: ApprovalStep;
    hr: ApprovalStep;
    finance: ApprovalStep;
  };
};

export type RequestsStatItem = {
  id: string;
  label: string;
  value: string;
  icon: "pending" | "approved" | "open_positions";
};
