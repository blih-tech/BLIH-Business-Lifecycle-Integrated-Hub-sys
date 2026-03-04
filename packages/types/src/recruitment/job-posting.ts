export type JobPostingStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'FILLED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface CreateJobPostingDto {
  recruitmentRequestId: string;
  positionId?: string | null;
  positionSnapshot?: Record<string, unknown> | null;
  description?: Record<string, unknown> | null;
  prerequisites?: Record<string, unknown> | null;
  kpis?: unknown[] | null;
  platforms?: string[];
}

export interface UpdateJobPostingDto {
  positionId?: string | null;
  positionSnapshot?: Record<string, unknown> | null;
  description?: Record<string, unknown> | null;
  prerequisites?: Record<string, unknown> | null;
  kpis?: unknown[] | null;
  platforms?: string[];
  status?: JobPostingStatus;
  postedAt?: string | null;
  expiresAt?: string | null;
  closedAt?: string | null;
}

export interface JobPostingResponseDto {
  id: string;
  postingId: string;
  recruitmentRequestId: string;
  positionId: string | null;
  positionTitle?: string | null;
  positionSnapshot: unknown;
  description: unknown;
  prerequisites: unknown;
  kpis: unknown;
  platforms: string[];
  status: JobPostingStatus;
  postedAt: string | null;
  expiresAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  candidatesCount?: number;
}
