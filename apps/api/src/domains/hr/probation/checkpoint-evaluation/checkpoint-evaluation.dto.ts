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

// ─── Nested Input DTO ─────────────────────────────────────────────────────────

export class CreateEvaluationScoreDto {
  @ApiProperty({
    description:
      'UUID of the ProbationKPI (the join-table row linking a KPI to this probation plan).',
    example: 'probation-kpi-uuid-1',
  })
  @IsUUID()
  probationKpiId!: string;

  @ApiProperty({
    description: 'Score for this KPI, between 0 and 100 (inclusive).',
    example: 85,
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
    example: 'Clean and maintainable code',
  })
  @IsOptional()
  @IsString()
  comment?: string | null;
}

// ─── Main Input DTO ───────────────────────────────────────────────────────────

export class CreateCheckpointEvaluationDto {
  @ApiProperty({
    description: 'UUID of the ProbationCheckpoint this evaluation belongs to.',
    example: 'checkpoint-uuid-1',
  })
  @IsUUID()
  checkpointId!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'General comment about the evaluation.',
    example: 'Improving well, but teamwork needs attention.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string | null;

  @ApiProperty({
    type: () => [CreateEvaluationScoreDto],
    description:
      'Scores for each KPI assigned to the probation plan. Must include at least one score. ' +
      'Each `probationKpiId` must belong to the same probation plan as the checkpoint. ' +
      '`totalScore` is calculated automatically as the average of all scores.',
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateEvaluationScoreDto)
  scores!: CreateEvaluationScoreDto[];
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class EvaluationScoreResponseDto {
  @ApiProperty({ example: 'score-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'probation-kpi-uuid-1' })
  probationKpiId!: string;

  @ApiProperty({
    example: 'Q1 Sales Target',
    description: 'Name of the KPI for display purposes.',
  })
  kpiName!: string;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  score!: number;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Clean and maintainable code',
  })
  comment!: string | null;

  @ApiProperty({ example: '2026-03-21T14:00:00.000Z' })
  createdAt!: string;
}

export class CheckpointEvaluationResponseDto {
  @ApiProperty({ example: 'evaluation-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'checkpoint-uuid-1' })
  checkpointId!: string;

  @ApiProperty({
    example: 'Month 1 Review',
    description: 'Name of the checkpoint, returned for frontend convenience.',
  })
  checkpointName!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Improving well, but teamwork needs attention.',
  })
  comment!: string | null;

  @ApiProperty({
    example: 80,
    description: 'Average of all KPI scores, calculated server-side.',
  })
  totalScore!: number;

  @ApiProperty({ type: () => [EvaluationScoreResponseDto] })
  scores!: EvaluationScoreResponseDto[];

  @ApiProperty({ example: '2026-03-21T14:00:00.000Z' })
  createdAt!: string;
}
