import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const PROBATION_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'FAILED',
  'EXTENDED',
] as const;
export type ProbationStatusValue = (typeof PROBATION_STATUSES)[number];

const normalizeEnumValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[\s-]+/g, '_').toUpperCase();
};

// ─── Nested Input DTOs ────────────────────────────────────────────────────────

export class CreateProbationKpiItemDto {
  @ApiProperty({
    description: 'UUID of the KPI to assign to this probation plan.',
    example: 'kpi-uuid-1',
  })
  @IsUUID()
  kpiId!: string;
}

export class CreateProbationCheckpointDto {
  @ApiProperty({
    example: 'Month 1 Review',
    description: 'Name of the checkpoint.',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Date for this checkpoint (ISO date-time or YYYY-MM-DD).',
    example: '2026-02-01',
  })
  @IsDateString()
  checkpointDate!: string;
}

// ─── Main Input DTOs ──────────────────────────────────────────────────────────

export class CreateProbationDto {
  @ApiProperty({
    description: 'Employee UUID for the probation plan.',
    example: 'employee-uuid',
  })
  @IsUUID()
  employeeId!: string;

  @ApiProperty({
    description: 'Probation start date (YYYY-MM-DD).',
    example: '2026-01-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Probation end date (YYYY-MM-DD).',
    example: '2026-03-31',
  })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({
    enum: PROBATION_STATUSES,
    description: 'Initial probation status.',
    example: 'NOT_STARTED',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(PROBATION_STATUSES)
  status?: ProbationStatusValue;

  @ApiPropertyOptional({
    type: () => [CreateProbationKpiItemDto],
    description: 'KPIs to assign to this probation plan.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProbationKpiItemDto)
  kpis?: CreateProbationKpiItemDto[];

  @ApiPropertyOptional({
    type: () => [CreateProbationCheckpointDto],
    description: 'Checkpoints to create within this probation plan.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProbationCheckpointDto)
  checkpoints?: CreateProbationCheckpointDto[];
}

// ─── Update DTOs ──────────────────────────────────────────────────────────────

export class UpdateProbationCheckpointDto {
  @ApiProperty({ example: 'Month 1 Review' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '2026-02-01' })
  @IsDateString()
  checkpointDate!: string;
}

export class UpdateProbationDto extends PartialType(CreateProbationDto) {
  @ApiPropertyOptional({
    type: () => [UpdateProbationCheckpointDto],
    description:
      'Checkpoints to sync. Items not included are removed.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProbationCheckpointDto)
  checkpoints?: UpdateProbationCheckpointDto[];
}

// ─── Query DTO ────────────────────────────────────────────────────────────────

export class ProbationListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by employee UUID.',
    example: 'employee-uuid',
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({
    enum: PROBATION_STATUSES,
    description: 'Filter by probation status.',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(PROBATION_STATUSES)
  status?: ProbationStatusValue;

  @ApiPropertyOptional({
    description: 'Filter probation start date from (YYYY-MM-DD).',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter probation start date to (YYYY-MM-DD).',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Page index (1-based).',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Items per page.',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class ProbationKpiItemResponseDto {
  @ApiProperty({ example: 'probation-kpi-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'kpi-uuid-1' })
  kpiId!: string;

  @ApiProperty({ example: 'Q1 Sales Target' })
  kpiName!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: string;
}

export class ProbationCheckpointResponseDto {
  @ApiProperty({ example: 'checkpoint-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'Month 1 Review' })
  name!: string;

  @ApiProperty({ example: '2026-02-01T00:00:00.000Z' })
  checkpointDate!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: string;
}

export class ProbationResponseDto {
  @ApiProperty({ example: 'probation-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'employee-uuid' })
  employeeId!: string;

  @ApiProperty({ example: '2026-01-01' })
  startDate!: string;

  @ApiProperty({ example: '2026-03-31' })
  endDate!: string;

  @ApiProperty({ enum: PROBATION_STATUSES, example: 'NOT_STARTED' })
  status!: ProbationStatusValue;

  @ApiProperty({ type: () => [ProbationKpiItemResponseDto] })
  kpis!: ProbationKpiItemResponseDto[];

  @ApiProperty({ type: () => [ProbationCheckpointResponseDto] })
  checkpoints!: ProbationCheckpointResponseDto[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: string;
}
