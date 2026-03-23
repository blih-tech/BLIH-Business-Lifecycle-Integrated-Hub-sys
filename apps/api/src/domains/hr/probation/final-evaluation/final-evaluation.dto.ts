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

// ─── Enums ────────────────────────────────────────────────────────────────────

export const PROBATION_OUTCOMES = [
  'CONFIRMED',
  'EXTENDED',
  'TERMINATED',
  'RESIGNED',
] as const;
export type ProbationOutcomeValue = (typeof PROBATION_OUTCOMES)[number];

// ─── Nested Input DTO ─────────────────────────────────────────────────────────

export class CreateFinalScoreDto {
  @ApiProperty({
    description:
      'UUID of the ProbationKPI (the join-table row linking a KPI to the probation plan).',
    example: 'probation-kpi-uuid-1',
  })
  @IsUUID()
  probationKpiId!: string;

  @ApiProperty({
    description: 'Score for this KPI, between 0 and 100 (inclusive).',
    example: 90,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Optional comment explaining the score.',
    example: 'Consistently high-quality code',
  })
  @IsOptional()
  @IsString()
  comment?: string | null;
}

// ─── Main Input DTO ───────────────────────────────────────────────────────────

export class CreateFinalEvaluationDto {
  @ApiProperty({
    description: 'UUID of the ProbationPlan this final evaluation belongs to.',
    example: 'probation-uuid-1',
  })
  @IsUUID()
  probationId!: string;

  @ApiProperty({
    enum: PROBATION_OUTCOMES,
    description:
      'Outcome decision for the probation. Automatically updates the probation plan status:\n' +
      '- `CONFIRMED` → plan status becomes `COMPLETED`\n' +
      '- `EXTENDED` → plan status becomes `EXTENDED`\n' +
      '- `TERMINATED` → plan status becomes `FAILED`\n' +
      '- `RESIGNED` → plan status becomes `CANCELLED`',
    example: 'CONFIRMED',
  })
  @IsEnum(PROBATION_OUTCOMES)
  outcome!: ProbationOutcomeValue;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Overall comment on the final evaluation.',
    example: 'Strong performance overall. Ready for full-time role.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string | null;

  @ApiProperty({
    type: () => [CreateFinalScoreDto],
    description:
      'Scores for every KPI in the probation plan. Must include at least one. ' +
      '`totalScore` is computed automatically as the average. ',
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFinalScoreDto)
  scores!: CreateFinalScoreDto[];
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class FinalScoreResponseDto {
  @ApiProperty({ example: 'score-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'probation-kpi-uuid-1' })
  probationKpiId!: string;

  @ApiProperty({
    example: 'Q1 Sales Target',
    description: 'KPI name for display.',
  })
  kpiName!: string;

  @ApiProperty({ example: 90, minimum: 0, maximum: 100 })
  score!: number;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Consistently high-quality code',
  })
  comment!: string | null;

  @ApiProperty({ example: '2026-03-21T14:00:00.000Z' })
  createdAt!: string;
}

export class FinalEvaluationResponseDto {
  @ApiProperty({ example: 'final-eval-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'probation-uuid-1' })
  probationId!: string;

  @ApiProperty({ enum: PROBATION_OUTCOMES, example: 'CONFIRMED' })
  outcome!: ProbationOutcomeValue;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Strong performance overall. Ready for full-time role.',
  })
  comment!: string | null;

  @ApiProperty({
    example: 87,
    description: 'Average of all KPI scores, computed server-side.',
  })
  totalScore!: number;

  @ApiProperty({ type: () => [FinalScoreResponseDto] })
  scores!: FinalScoreResponseDto[];

  @ApiProperty({ example: '2026-03-21T14:00:00.000Z' })
  createdAt!: string;
}
