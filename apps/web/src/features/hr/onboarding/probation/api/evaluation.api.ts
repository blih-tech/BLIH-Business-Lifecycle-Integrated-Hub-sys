import { requestJson } from '@/features/hr/onboarding/shared/api-client';
import type {
  CheckpointEvaluationResponseDto,
  CreateCheckpointEvaluationDto,
  CreateFinalEvaluationDto,
  FinalEvaluationResponseDto,
  UpdateCheckpointEvaluationDto,
} from '@/types';

const CHECKPOINT_BASE = '/hr/probation/checkpoint-evaluations';
const FINAL_BASE = '/hr/probation/final-evaluations';

export async function createCheckpointEvaluation(
  data: CreateCheckpointEvaluationDto,
): Promise<CheckpointEvaluationResponseDto> {
  return requestJson<CheckpointEvaluationResponseDto>(
    CHECKPOINT_BASE,
    'POST',
    data,
  );
}

export async function updateCheckpointEvaluation(
  id: string,
  data: UpdateCheckpointEvaluationDto,
): Promise<CheckpointEvaluationResponseDto> {
  return requestJson<CheckpointEvaluationResponseDto>(
    `${CHECKPOINT_BASE}/${id}`,
    'PATCH',
    data,
  );
}

export async function createFinalEvaluation(
  data: CreateFinalEvaluationDto,
): Promise<FinalEvaluationResponseDto> {
  return requestJson<FinalEvaluationResponseDto>(FINAL_BASE, 'POST', data);
}

export async function getFinalEvaluations(
  probationId?: string,
): Promise<FinalEvaluationResponseDto[]> {
  if (!probationId) {
    return [];
  }
  const record = await requestJson<FinalEvaluationResponseDto>(
    `${FINAL_BASE}/by-probation/${probationId}`,
  );
  return record ? [record] : [];
}
