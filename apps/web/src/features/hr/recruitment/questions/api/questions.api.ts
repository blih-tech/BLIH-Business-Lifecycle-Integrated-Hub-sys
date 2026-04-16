import { apiClient } from '@/lib/api-client';
import type {
  CreateInterviewQuestionDto,
  InterviewQuestionResponseDto,
  UpdateInterviewQuestionDto,
} from '@/types';

const QUESTIONS_BASE = '/hr/recruitment/interview-questions';

export async function createQuestion(
  data: CreateInterviewQuestionDto,
): Promise<InterviewQuestionResponseDto> {
  return apiClient.post<InterviewQuestionResponseDto>(QUESTIONS_BASE, data);
}

export async function updateQuestion(
  id: string,
  data: UpdateInterviewQuestionDto,
): Promise<InterviewQuestionResponseDto> {
  return apiClient.patch<InterviewQuestionResponseDto>(
    `${QUESTIONS_BASE}/${id}`,
    data,
  );
}

export async function deactivateQuestion(id: string): Promise<void> {
  await apiClient.patch(`${QUESTIONS_BASE}/${id}/deactivate`, {});
}
