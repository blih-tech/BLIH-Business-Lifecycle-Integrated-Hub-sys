import type { CandidateSource } from './jobs.js';

export type ApplicantStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'WAITLIST'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export const APPLICANT_STATUSES = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW',
  'WAITLIST',
  'OFFER',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;

export interface ApplicantStatusHistoryDto {
  id: string;
  changedById: string | null;
  fromStatus: ApplicantStatus | null;
  toStatus: ApplicantStatus;
  notes: string | null;
  changedAt: string;
}

export interface ApplicantEducationDto {
  institution: string;
  degree: string;
  field: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ApplicantExperienceDto {
  company: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface CreateApplicantDto {
  jobId: string;
  applicationFormId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  resumeUrl: string;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  source?: CandidateSource;
  referredById?: string | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  yearsExperience?: number | null;
  location?: string | null;
  nationality?: string | null;
  expectedSalary?: number | null;
  currentSalary?: number | null;
  educationLevel?: string | null;
  highestDegree?: string | null;
  skills?: string[];
  coverLetter?: string | null;
  sourceSnapshot?: Record<string, unknown> | null;
  customFieldValues?: Record<string, unknown> | null;
  educations?: ApplicantEducationDto[];
  experiences?: ApplicantExperienceDto[];
}

export type UpdateApplicantDto = Partial<CreateApplicantDto>;

export interface UpdateApplicantStatusDto {
  status: ApplicantStatus;
  notes?: string | null;
}

export type BulkReviewApplicantStatus = 'SHORTLISTED' | 'REJECTED';
export const BULK_REVIEW_APPLICANT_STATUSES = [
  'SHORTLISTED',
  'REJECTED',
] as const;

export interface BulkUpdateApplicantStatusDto {
  applicantIds: string[];
  status: BulkReviewApplicantStatus;
  notes?: string | null;
}

export interface ApplicantResponseDto {
  id: string;
  jobId: string;
  applicationFormId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  source: CandidateSource;
  referredById: string | null;
  currentCompany: string | null;
  currentPosition: string | null;
  yearsExperience: number | null;
  location: string | null;
  nationality: string | null;
  expectedSalary: string | null;
  currentSalary: string | null;
  educationLevel: string | null;
  highestDegree: string | null;
  skills: string[];
  status: ApplicantStatus;
  coverLetter: string | null;
  sourceSnapshot: Record<string, unknown> | null;
  customFieldValues: Record<string, unknown> | null;
  appliedAt: string;
  screeningAt: string | null;
  shortlistedAt: string | null;
  interviewAt: string | null;
  waitlistAt: string | null;
  offerAt: string | null;
  hiredAt: string | null;
  rejectedAt: string | null;
  withdrawnAt: string | null;
  lastActivityAt: string | null;
  profileScore: number | null;
  educations: Array<ApplicantEducationDto & { id: string }>;
  experiences: Array<ApplicantExperienceDto & { id: string }>;
  statusHistory: ApplicantStatusHistoryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BulkApplicantStatusResponseDto {
  status: BulkReviewApplicantStatus;
  requestedCount: number;
  updatedCount: number;
  applicants: ApplicantResponseDto[];
}

export interface ApplicantListQueryDto {
  status?: ApplicantStatus;
  jobId?: string;
  email?: string;
  search?: string;
}
