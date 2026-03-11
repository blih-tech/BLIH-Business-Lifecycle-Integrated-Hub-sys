import type { EndorsementLevel, InterviewType } from './jobs.js';

export type InterviewStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type InterviewAttendanceStatus =
  | 'SCHEDULED'
  | 'ATTENDING'
  | 'NO_SHOW'
  | 'COMPLETED'
  | 'CANCELLED';

export type InterviewQuestionCategory =
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'SITUATIONAL'
  | 'PROBLEM_SOLVING'
  | 'LEADERSHIP'
  | 'COMMUNICATION'
  | 'DOMAIN_KNOWLEDGE'
  | 'CULTURAL_FIT'
  | 'GENERAL';

export type InterviewQuestionType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'BOOLEAN'
  | 'RATING'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT';

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

export const INTERVIEW_ATTENDANCE_STATUSES = [
  'SCHEDULED',
  'ATTENDING',
  'NO_SHOW',
  'COMPLETED',
  'CANCELLED',
] as const;

export const INTERVIEW_QUESTION_CATEGORIES = [
  'TECHNICAL',
  'BEHAVIORAL',
  'SITUATIONAL',
  'PROBLEM_SOLVING',
  'LEADERSHIP',
  'COMMUNICATION',
  'DOMAIN_KNOWLEDGE',
  'CULTURAL_FIT',
  'GENERAL',
] as const;

export const INTERVIEW_QUESTION_TYPES = [
  'TEXT',
  'TEXTAREA',
  'BOOLEAN',
  'RATING',
  'SINGLE_SELECT',
  'MULTI_SELECT',
] as const;

export const ENDORSEMENT_LEVELS = [
  'STRONG_YES',
  'YES',
  'UNCERTAIN',
  'NO',
] as const;

export type InterviewQuestionResponseAnswer =
  | string
  | boolean
  | number
  | string[]
  | null;

export interface InterviewQuestionResponseInputItemDto {
  questionId?: string | null;
  question: string;
  category?: InterviewQuestionCategory | null;
  type: InterviewQuestionType;
  answer: InterviewQuestionResponseAnswer;
  score?: number | null;
  maxScore?: number | null;
  weight?: number | null;
  notes?: string | null;
}

export interface InterviewQuestionResponseItemDto {
  questionId: string | null;
  question: string;
  category: InterviewQuestionCategory | null;
  type: InterviewQuestionType;
  answer: InterviewQuestionResponseAnswer;
  score: number | null;
  maxScore: number | null;
  weight: number | null;
  notes: string | null;
}

export interface CreateInterviewQuestionDto {
  question: string;
  description?: string | null;
  category?: InterviewQuestionCategory | null;
  type: InterviewQuestionType;
  options?: string[];
  difficulty?: number | null;
  tags?: string[];
  isActive?: boolean;
}

export type UpdateInterviewQuestionDto = Partial<CreateInterviewQuestionDto>;

export interface InterviewQuestionListQueryDto {
  category?: InterviewQuestionCategory;
  tags?: string[];
  difficulty?: number;
  isActive?: boolean;
}

export interface InterviewQuestionDto {
  id: string;
  question: string;
  description: string | null;
  category: InterviewQuestionCategory | null;
  type: InterviewQuestionType;
  options: string[];
  difficulty: number | null;
  tags: string[];
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewerAssignmentInputDto {
  interviewerId: string;
  role?: string | null;
}

export interface CreateInterviewDto {
  jobId: string;
  type: InterviewType;
  round?: number;
  status?: InterviewStatus;
  scheduledAt: string;
  durationMinutes?: number | null;
  location?: string | null;
  meetingUrl?: string | null;
  applicantIds: string[];
  interviewers: InterviewerAssignmentInputDto[];
}

export type UpdateInterviewDto = Partial<Omit<CreateInterviewDto, 'jobId'>>;

export interface UpdateInterviewParticipantAttendanceDto {
  attendanceStatus: InterviewAttendanceStatus;
}

export interface UpsertInterviewFeedbackDto {
  score?: number | null;
  endorsement?: EndorsementLevel | null;
  strengths?: string[];
  weaknesses?: string[];
  questionResponses?: InterviewQuestionResponseInputItemDto[];
  notes?: string | null;
  isDraft?: boolean;
}

export interface InterviewResponseParticipantApplicantDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface InterviewResponseParticipantDto {
  id: string;
  sessionId: string;
  applicantId: string;
  attendanceStatus: InterviewAttendanceStatus;
  applicant: InterviewResponseParticipantApplicantDto | null;
  createdAt: string;
}

export interface InterviewResponseInterviewerDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface InterviewResponseAssignmentDto {
  id: string;
  sessionId: string;
  interviewerId: string;
  role: string | null;
  interviewer: InterviewResponseInterviewerDto | null;
  createdAt: string;
}

export interface InterviewFeedbackResponseDto {
  id: string;
  participantId: string;
  assignmentId: string;
  interviewerId: string | null;
  score: number | null;
  endorsement: EndorsementLevel | null;
  strengths: string[];
  weaknesses: string[];
  questionResponses: InterviewQuestionResponseItemDto[] | null;
  notes: string | null;
  isDraft: boolean;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewResponseDto {
  id: string;
  jobId: string;
  type: InterviewType;
  round: number;
  status: InterviewStatus;
  scheduledAt: string;
  durationMinutes: number | null;
  location: string | null;
  meetingUrl: string | null;
  createdById: string;
  participants: InterviewResponseParticipantDto[];
  interviewers: InterviewResponseAssignmentDto[];
  feedbacks: InterviewFeedbackResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewListQueryDto {
  jobId?: string;
  type?: InterviewType;
  status?: InterviewStatus;
  round?: number;
  applicantId?: string;
  interviewerId?: string;
}
