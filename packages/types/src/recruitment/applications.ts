export type JobApplicationStatus =
  | 'NEW'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW_STAGE'
  | 'OFFER_PENDING'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

/** Const array for validation/Swagger */
export const JOB_APPLICATION_STATUSES = [
  'NEW',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW_STAGE',
  'OFFER_PENDING',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;

export interface CreateJobApplicationDto {
  jobId: string;
  candidateId: string;
  coverLetter?: string | null;
  expectedSalary?: number | null;
  sourceSnapshot?: Record<string, unknown> | null;
}

export interface UpdateApplicationStatusDto {
  status: JobApplicationStatus;
  notes?: string | null;
}

export interface JobApplicationResponseDto {
  id: string;
  jobId: string;
  candidateId: string;
  status: JobApplicationStatus;
  coverLetter: string | null;
  expectedSalary: string | null;
  appliedAt: string;
  sourceSnapshot: unknown;
  createdAt: string;
  updatedAt: string;
}
