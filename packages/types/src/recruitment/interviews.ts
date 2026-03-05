import type { EndorsementLevel, InterviewType } from './jobs.js';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface CreateInterviewDto {
  applicationId: string;
  type: InterviewType;
  round?: number;
  status?: InterviewStatus;
  scheduledAt?: string | null;
  completedAt?: string | null;
  interviewerId?: string | null;
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
