export type CandidateStatus =
  | 'NEW'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW_STAGE'
  | 'OFFER_PENDING'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type CandidateSource =
  | 'COMPANY_SITE'
  | 'LINKEDIN'
  | 'TELEGRAM'
  | 'REFERRAL'
  | 'AGENCY';

export interface CreateCandidateDto {
  jobPostingId: string;
  source?: CandidateSource;
  referralUserId?: string | null;
  personalInfo?: Record<string, unknown> | null;
  career?: Record<string, unknown> | null;
  applicationResponses?: Record<string, unknown> | null;
}

export interface UpdateCandidateDto {
  source?: CandidateSource;
  referralUserId?: string | null;
  personalInfo?: Record<string, unknown> | null;
  career?: Record<string, unknown> | null;
  applicationResponses?: Record<string, unknown> | null;
  pipeline?: Record<string, unknown> | null;
  rejection?: Record<string, unknown> | null;
}

export interface PipelineStatusUpdateDto {
  status: CandidateStatus;
  pipeline?: Record<string, unknown> | null;
  rejection?: Record<string, unknown> | null;
}

export interface CandidateResponseDto {
  id: string;
  candidateId: string;
  jobPostingId: string;
  jobPostingTitle?: string | null;
  source: CandidateSource;
  referralUserId: string | null;
  personalInfo: unknown;
  career: unknown;
  applicationResponses: unknown;
  status: CandidateStatus;
  pipeline: unknown;
  rejection: unknown;
  createdAt: string;
  updatedAt: string;
  screeningsCount?: number;
  interviewFeedbackCount?: number;
}
