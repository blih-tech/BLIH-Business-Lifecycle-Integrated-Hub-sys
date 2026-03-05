export type JobApplicationStatus =
  | 'NEW'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW_STAGE'
  | 'OFFER_PENDING'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

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
