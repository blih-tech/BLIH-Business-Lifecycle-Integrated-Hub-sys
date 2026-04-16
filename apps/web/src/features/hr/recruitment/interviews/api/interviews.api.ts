import { apiClient } from '@/lib/api-client';
import type {
  CreateInterviewDto,
  InterviewResponseDto,
  SubmitFeedbackDto,
  UpdateAttendanceDto,
  UpdateInterviewDto,
} from '@/types';

const INTERVIEWS_BASE = '/hr/recruitment/interviews';

export async function createInterview(
  data: CreateInterviewDto,
): Promise<InterviewResponseDto> {
  return apiClient.post<InterviewResponseDto>(INTERVIEWS_BASE, data);
}

export async function updateInterview(
  id: string,
  data: UpdateInterviewDto,
): Promise<InterviewResponseDto> {
  return apiClient.patch<InterviewResponseDto>(
    `${INTERVIEWS_BASE}/${id}`,
    data,
  );
}

export async function submitInterviewFeedback(
  interviewId: string,
  participantId: string,
  data: SubmitFeedbackDto,
): Promise<void> {
  await apiClient.post(
    `${INTERVIEWS_BASE}/${interviewId}/participants/${participantId}/feedback`,
    data,
  );
}

export async function updateAttendance(
  interviewId: string,
  participantId: string,
  data: UpdateAttendanceDto,
): Promise<void> {
  await apiClient.patch(
    `${INTERVIEWS_BASE}/${interviewId}/participants/${participantId}/attendance`,
    data,
  );
}
