import type { EndorsementLevel, InterviewType } from './jobs.js';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

/** Const array for validation/Swagger */
export const INTERVIEW_TYPES = [
  'HR_SCREENING',
  'TECHNICAL',
  'BEHAVIORAL',
  'PANEL',
  'FINAL',
] as const;

export const INTERVIEW_STATUSES = [
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;

export const ENDORSEMENT_LEVELS = [
  'STRONG_YES',
  'YES',
  'UNCERTAIN',
  'NO',
] as const;

export interface CreateInterviewDto {
  applicationId: string;
  type: InterviewType;
  interviewerId: string;
  round?: number;
  status?: InterviewStatus;
  scheduledAt?: string | null;
  completedAt?: string | null;
  interviewers?: unknown[] | null;
  feedback?: string | null;
  endorsement?: EndorsementLevel | null;
  score?: number | null;
  nextAction?: string | null;
}

export type UpdateInterviewDto = Partial<CreateInterviewDto>;

export interface InterviewResponseDto {
  id: string;
  applicationId: string;
  type: InterviewType;
  round: number;
  status: InterviewStatus;
  scheduledAt: string | null;
  completedAt: string | null;
  interviewerId: string | null;
  interviewers: unknown;
  feedback: string | null;
  endorsement: EndorsementLevel | null;
  score: string | null;
  nextAction: string | null;
  createdAt: string;
  updatedAt: string;
}
