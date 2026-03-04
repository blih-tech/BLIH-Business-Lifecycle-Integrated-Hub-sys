export type InterviewType =
  | 'HR_SCREENING'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'PANEL'
  | 'FINAL';

export type EndorsementLevel = 'STRONG_YES' | 'YES' | 'UNCERTAIN' | 'NO';

export interface CreateInterviewFeedbackDto {
  candidateId: string;
  interviewRound: number;
  interviewType: InterviewType;
  scheduledAt?: string | null;
  completedAt?: string | null;
  interviewers?: unknown[] | null;
  ratings?: Record<string, unknown> | null;
  totalRating?: number | null;
  endorsement?: EndorsementLevel | null;
  remarks?: string | null;
  nextAction?: string | null;
  ranking?: number | null;
}

export interface InterviewFeedbackResponseDto {
  id: string;
  candidateId: string;
  interviewRound: number;
  interviewType: InterviewType;
  scheduledAt: string | null;
  completedAt: string | null;
  interviewers: unknown;
  ratings: unknown;
  totalRating: string | null;
  endorsement: EndorsementLevel | null;
  remarks: string | null;
  nextAction: string | null;
  compiledById: string;
  compiledByEmail?: string | null;
  compiledAt: string;
  ranking: number | null;
  createdAt: string;
  updatedAt: string;
}
