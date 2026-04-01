import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeCreatedResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  ActionSuccessResponseDto,
} from '../../../../shared/docs/openapi';
import { ProbationPlanPermissions } from '@repo/types/rbac';
import {
  CheckpointEvaluationResponseDto,
  CreateCheckpointEvaluationDto,
} from './checkpoint-evaluation.dto';

// ─── Update DTO (separately defined to avoid circular deps with docs) ─────────

export class UpdateEvaluationScoreDto {
  @ApiProperty({ example: 'probation-kpi-uuid-1' })
  @IsUUID()
  probationKpiId!: string;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional({ nullable: true, example: 'Improved code quality' })
  @IsOptional()
  @IsString()
  comment?: string | null;
}

export class UpdateCheckpointEvaluationDto {
  @ApiPropertyOptional({ nullable: true, example: 'Updated overall comment.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string | null;

  @ApiPropertyOptional({
    type: () => [UpdateEvaluationScoreDto],
    description:
      'Full list of scores to sync. Scores for omitted KPIs are removed. `totalScore` is recomputed automatically.',
    minItems: 1,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateEvaluationScoreDto)
  scores?: UpdateEvaluationScoreDto[];
}

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-21T14:00:00.000Z',
  requestId: 'req_01HZ_CPE_EXAMPLE',
  version: 'v1',
};

const envelope = <TData>(message: string, data: TData) => ({
  success: true,
  message,
  data,
  error: null,
  meta: metaExample,
});

const scoreExample = {
  id: 'score-uuid-1',
  probationKpiId: 'probation-kpi-uuid-1',
  kpiName: 'Q1 Sales Target',
  score: 85,
  comment: 'Clean and maintainable code',
  createdAt: '2026-03-21T14:00:00.000Z',
};

const evaluationExample = {
  id: 'evaluation-uuid-1',
  checkpointId: 'checkpoint-uuid-1',
  checkpointName: 'Month 1 Review',
  comment: 'Improving well, but teamwork needs attention',
  totalScore: 80,
  scores: [scoreExample],
  createdAt: '2026-03-21T14:00:00.000Z',
};

const createdResponse = envelope(
  'Checkpoint evaluation created successfully',
  evaluationExample,
);
const retrievedResponse = envelope(
  'Checkpoint evaluation retrieved successfully',
  evaluationExample,
);
const updatedResponse = envelope(
  'Checkpoint evaluation updated successfully',
  evaluationExample,
);
const listResponse = envelope('Checkpoint evaluations retrieved successfully', [
  evaluationExample,
]);
const deletedResponse = envelope('Checkpoint evaluation deleted successfully', {
  success: true,
});

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiCheckpointEvaluationsTag() {
  return applyDecorators(ApiTags('HR Probation – Checkpoint Evaluations'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateCheckpointEvaluation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit a checkpoint evaluation',
      description:
        'Creates an evaluation for a checkpoint with per-KPI scores. ' +
        '`totalScore` is **computed automatically** as the average of all scores — do not pass it in the request body. ' +
        'Only one evaluation is allowed per checkpoint (returns 409 if one already exists).',
    }),
    ApiBody({
      type: CreateCheckpointEvaluationDto,
      examples: {
        create: {
          summary: 'Evaluate Month 1 checkpoint',
          value: {
            checkpointId: 'checkpoint-uuid-1',
            comment: 'Improving well, but teamwork needs attention',
            scores: [
              {
                probationKpiId: 'probation-kpi-uuid-1',
                score: 85,
                comment: 'Clean and maintainable code',
              },
              {
                probationKpiId: 'probation-kpi-uuid-2',
                score: 90,
                comment: 'Always on time',
              },
              {
                probationKpiId: 'probation-kpi-uuid-3',
                score: 65,
                comment: 'Needs better collaboration',
              },
            ],
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/checkpoint-evaluations',
      roles: [ProbationPlanPermissions.CREATE],
    }),
    ApiEnvelopeCreatedResponse(
      CheckpointEvaluationResponseDto,
      'Submitted checkpoint evaluation',
      createdResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/checkpoint-evaluations',
      badRequest:
        'Payload is invalid (missing fields, invalid scores or KPI IDs)',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetCheckpointEvaluationById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get checkpoint evaluation by ID' }),
    ApiParam({ name: 'id', description: 'Checkpoint evaluation UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/checkpoint-evaluations/:id',
      roles: [ProbationPlanPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      CheckpointEvaluationResponseDto,
      'Checkpoint evaluation details',
      retrievedResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/checkpoint-evaluations/:id',
      notFound: 'Checkpoint evaluation not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetEvaluationByCheckpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get evaluation for a specific checkpoint',
      description:
        'Returns the single evaluation for a given checkpoint UUID. Useful for the frontend to check if a checkpoint has been evaluated.',
    }),
    ApiParam({ name: 'checkpointId', description: 'ProbationCheckpoint UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/checkpoint-evaluations/by-checkpoint/:checkpointId',
      roles: [ProbationPlanPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      CheckpointEvaluationResponseDto,
      'Evaluation for the checkpoint',
      retrievedResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/checkpoint-evaluations/by-checkpoint/:checkpointId',
      notFound: 'Checkpoint or evaluation not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListEvaluationsByProbation() {
  return applyDecorators(
    ApiOperation({
      summary: 'List all checkpoint evaluations for a probation plan',
      description:
        'Returns evaluations for every checkpoint in a probation plan, ordered by checkpoint date. ' +
        'Useful for the frontend progress/timeline view.',
    }),
    ApiParam({ name: 'probationId', description: 'ProbationPlan UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/checkpoint-evaluations/by-probation/:probationId',
      roles: [ProbationPlanPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      CheckpointEvaluationResponseDto,
      'Checkpoint evaluations for this probation plan',
      listResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/checkpoint-evaluations/by-probation/:probationId',
      notFound: 'Probation plan not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiUpdateCheckpointEvaluation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a checkpoint evaluation',
      description:
        'Updates the comment and/or syncs scores. If `scores` is provided, ' +
        'the list is treated as the full intended state — missing KPIs are removed. ' +
        '`totalScore` is **recomputed automatically**.',
    }),
    ApiParam({ name: 'id', description: 'Checkpoint evaluation UUID' }),
    ApiBody({
      type: UpdateCheckpointEvaluationDto,
      examples: {
        update: {
          summary: 'Re-score and update comment',
          value: {
            comment: 'Significant improvement this month',
            scores: [
              {
                probationKpiId: 'probation-kpi-uuid-1',
                score: 90,
                comment: 'Excellent code',
              },
              { probationKpiId: 'probation-kpi-uuid-2', score: 95 },
              {
                probationKpiId: 'probation-kpi-uuid-3',
                score: 75,
                comment: 'Better collaboration',
              },
            ],
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/checkpoint-evaluations/:id',
      roles: [ProbationPlanPermissions.UPDATE],
    }),
    ApiEnvelopeOkResponse(
      CheckpointEvaluationResponseDto,
      'Updated checkpoint evaluation',
      updatedResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/checkpoint-evaluations/:id',
      badRequest: 'Payload is invalid',
      notFound: 'Checkpoint evaluation not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiDeleteCheckpointEvaluation() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a checkpoint evaluation' }),
    ApiParam({ name: 'id', description: 'Checkpoint evaluation UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/checkpoint-evaluations/:id',
      roles: [ProbationPlanPermissions.ALL],
    }),
    ApiEnvelopeOkResponse(
      ActionSuccessResponseDto,
      'Deleted checkpoint evaluation',
      deletedResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/checkpoint-evaluations/:id',
      notFound: 'Checkpoint evaluation not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
