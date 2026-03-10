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
  applicantId: string;
  type: InterviewType;
  interviewerId: string;
  round?: number;
  status?: InterviewStatus;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMinutes?: number | null;
  location?: string | null;
  meetingUrl?: string | null;
  interviewers?: unknown[] | null;
  feedback?: string | null;
  endorsement?: EndorsementLevel | null;
  score?: number | null;
  nextAction?: string | null;
  notes?: string | null;
}

export type UpdateInterviewDto = Partial<CreateInterviewDto>;

export interface InterviewResponseDto {
  id: string;
  applicantId: string;
  type: InterviewType;
  round: number;
  status: InterviewStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMinutes: number | null;
  interviewerId: string | null;
  location: string | null;
  meetingUrl: string | null;
  interviewers: unknown;
  feedback: string | null;
  endorsement: EndorsementLevel | null;
  score: string | null;
  nextAction: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
