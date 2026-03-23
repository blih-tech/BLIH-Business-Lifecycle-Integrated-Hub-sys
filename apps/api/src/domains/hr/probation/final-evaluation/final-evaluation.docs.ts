import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ApiDefaultErrors,
  ApiEnvelopeCreatedResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  ActionSuccessResponseDto,
} from '../../../../shared/docs/openapi';
import { ProbationPlanPermissions } from '@repo/types/rbac';
import {
  FinalEvaluationResponseDto,
  PROBATION_OUTCOMES,
  ProbationOutcomeValue,
} from './final-evaluation.dto';
import { CreateFinalEvaluationDto } from './final-evaluation.dto';

// ─── Update DTO ───────────────────────────────────────────────────────────────

export class UpdateFinalScoreDto {
  @ApiProperty({ example: 'probation-kpi-uuid-1' })
  @IsUUID()
  probationKpiId!: string;

  @ApiProperty({ example: 92, minimum: 0, maximum: 100 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional({ nullable: true, example: 'Excellent improvement' })
  @IsOptional()
  @IsString()
  comment?: string | null;
}

export class UpdateFinalEvaluationDto {
  @ApiPropertyOptional({
    enum: PROBATION_OUTCOMES,
    description:
      'Change the outcome decision. Will automatically update the probation plan status.',
    example: 'CONFIRMED',
  })
  @IsOptional()
  @IsEnum(PROBATION_OUTCOMES)
  outcome?: ProbationOutcomeValue;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Updated comment after review.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string | null;

  @ApiPropertyOptional({
    type: () => [UpdateFinalScoreDto],
    description:
      'Full list of scores to replace. All previous scores are removed and replaced. `totalScore` is recomputed automatically.',
    minItems: 1,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateFinalScoreDto)
  scores?: UpdateFinalScoreDto[];
}

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-21T14:00:00.000Z',
  requestId: 'req_01HZ_FE_EXAMPLE',
  version: 'v1',
};

const envelope = <TData>(message: string, data: TData) => ({
  success: true,
  message,
  data,
  error: null,
  meta: metaExample,
});

const scoreExamples = [
  {
    id: 'score-uuid-1',
    probationKpiId: 'p-kpi-uuid-1',
    kpiName: 'Code Quality',
    score: 90,
    comment: 'Consistently high-quality code',
    createdAt: '2026-03-21T14:00:00.000Z',
  },
  {
    id: 'score-uuid-2',
    probationKpiId: 'p-kpi-uuid-2',
    kpiName: 'Attendance',
    score: 95,
    comment: 'Excellent attendance record',
    createdAt: '2026-03-21T14:00:00.000Z',
  },
  {
    id: 'score-uuid-3',
    probationKpiId: 'p-kpi-uuid-3',
    kpiName: 'Teamwork',
    score: 75,
    comment: 'Improved significantly over time',
    createdAt: '2026-03-21T14:00:00.000Z',
  },
];

const evalExample = {
  id: 'final-eval-uuid-1',
  probationId: 'probation-uuid-1',
  outcome: 'CONFIRMED',
  comment: 'Strong performance overall. Ready for full-time role.',
  totalScore: 86.67,
  scores: scoreExamples,
  createdAt: '2026-03-21T14:00:00.000Z',
};

const createdResp = envelope(
  'Final evaluation submitted successfully',
  evalExample,
);
const retrievedResp = envelope(
  'Final evaluation retrieved successfully',
  evalExample,
);
const updatedResp = envelope(
  'Final evaluation updated successfully',
  evalExample,
);
const deletedResp = envelope('Final evaluation deleted successfully', {
  success: true,
});

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiFinalEvaluationsTag() {
  return applyDecorators(ApiTags('HR Probation – Final Evaluations'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateFinalEvaluation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit a final probation evaluation',
      description:
        '**Business rules enforced by the server:**\n\n' +
        '- Only one final evaluation is allowed per probation plan (409 if duplicate)\n' +
        '- All checkpoints in the plan must have an evaluation before final eval can be submitted (422 if any checkpoint is unevaluated)\n' +
        '- All `probationKpiId` values must belong to the same probation plan\n' +
        '- `totalScore` is **computed automatically** as the average of scores\n' +
        '- `ProbationPlan.status` is **updated automatically** based on `outcome`:\n' +
        '  - `CONFIRMED` → `COMPLETED`\n' +
        '  - `EXTENDED` → `EXTENDED`\n' +
        '  - `TERMINATED` → `FAILED`\n' +
        '  - `RESIGNED` → `CANCELLED`',
    }),
    ApiBody({
      type: CreateFinalEvaluationDto,
      examples: {
        create: {
          summary: 'Submit confirmed final evaluation',
          value: {
            probationId: 'probation-uuid-1',
            outcome: 'CONFIRMED',
            comment: 'Strong performance overall. Ready for full-time role.',
            scores: [
              {
                probationKpiId: 'p-kpi-uuid-1',
                score: 90,
                comment: 'Consistently high-quality code',
              },
              {
                probationKpiId: 'p-kpi-uuid-2',
                score: 95,
                comment: 'Excellent attendance record',
              },
              {
                probationKpiId: 'p-kpi-uuid-3',
                score: 75,
                comment: 'Improved significantly over time',
              },
            ],
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/final-evaluations',
      roles: [ProbationPlanPermissions.ENDORSE],
    }),
    ApiEnvelopeCreatedResponse(
      FinalEvaluationResponseDto,
      'Submitted final evaluation',
      createdResp,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/final-evaluations',
      badRequest:
        'Payload invalid — duplicate KPI IDs or KPI IDs not belonging to plan',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetFinalEvaluationById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get final evaluation by its UUID' }),
    ApiParam({ name: 'id', description: 'FinalEvaluation UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/final-evaluations/:id',
      roles: [ProbationPlanPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      FinalEvaluationResponseDto,
      'Final evaluation details',
      retrievedResp,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/final-evaluations/:id',
      notFound: 'Final evaluation not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetFinalEvaluationByProbation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get final evaluation for a probation plan',
      description:
        'Fetches the single final evaluation linked to a probation plan. Useful for frontend summary/result page.',
    }),
    ApiParam({ name: 'probationId', description: 'ProbationPlan UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/final-evaluations/by-probation/:probationId',
      roles: [ProbationPlanPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      FinalEvaluationResponseDto,
      'Final evaluation for the probation plan',
      retrievedResp,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/final-evaluations/by-probation/:probationId',
      notFound: 'Probation plan or final evaluation not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiUpdateFinalEvaluation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a final evaluation',
      description:
        'Allows correcting the outcome, comment, or scores after submission. ' +
        'If `scores` is provided, **all previous scores are replaced** and `totalScore` is recomputed. ' +
        'If `outcome` changes, `ProbationPlan.status` is updated accordingly.',
    }),
    ApiParam({ name: 'id', description: 'FinalEvaluation UUID' }),
    ApiBody({
      type: UpdateFinalEvaluationDto,
      examples: {
        update: {
          summary: 'Correct outcome and re-score',
          value: {
            outcome: 'EXTENDED',
            comment: 'More time needed to reach target performance.',
            scores: [
              { probationKpiId: 'p-kpi-uuid-1', score: 78 },
              { probationKpiId: 'p-kpi-uuid-2', score: 82 },
              {
                probationKpiId: 'p-kpi-uuid-3',
                score: 60,
                comment: 'Focus area for extension period',
              },
            ],
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/final-evaluations/:id',
      roles: [ProbationPlanPermissions.ENDORSE],
    }),
    ApiEnvelopeOkResponse(
      FinalEvaluationResponseDto,
      'Updated final evaluation',
      updatedResp,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/final-evaluations/:id',
      badRequest: 'Payload invalid',
      notFound: 'Final evaluation not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiDeleteFinalEvaluation() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a final evaluation' }),
    ApiParam({ name: 'id', description: 'FinalEvaluation UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/final-evaluations/:id',
      roles: [ProbationPlanPermissions.ALL],
    }),
    ApiEnvelopeOkResponse(
      ActionSuccessResponseDto,
      'Deleted final evaluation',
      deletedResp,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/final-evaluations/:id',
      notFound: 'Final evaluation not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
