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

export const ENDORSEMENT_LEVELS = [
  'STRONG_YES',
  'YES',
  'UNCERTAIN',
  'NO',
] as const;

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
  notes?: string | null;
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
  sessionId: string;
  participantId: string;
  assignmentId: string;
  interviewerId: string | null;
  score: number | null;
  endorsement: EndorsementLevel | null;
  strengths: string[];
  weaknesses: string[];
  notes: string | null;
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
