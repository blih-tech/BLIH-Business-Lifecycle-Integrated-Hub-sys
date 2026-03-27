import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export const ONBOARDING_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;
export type OnboardingStatusValue = (typeof ONBOARDING_STATUSES)[number];

export const ONBOARDING_CHECKLIST_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
] as const;
export type OnboardingChecklistStatusValue =
  (typeof ONBOARDING_CHECKLIST_STATUSES)[number];

const normalizeEnumValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

// ─── Input DTOs ──────────────────────────────────────────────────────────────

export class CreateOnboardingChecklistItemDto {
  @ApiProperty({
    description: 'Onboarding task UUID to include in this checklist.',
    example: 'task-uuid-1',
  })
  @IsUUID()
  onboardingTaskId!: string;

  @ApiPropertyOptional({
    description: 'Target due date for this checklist item.',
    example: '2026-03-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class CreateOnboardingDto {
  @ApiProperty({
    description: 'Employee UUID for the onboarding record.',
    example: 'employee-uuid',
  })
  @IsUUID()
  employeeId!: string;

  @ApiProperty({
    description: 'Employee join date (YYYY-MM-DD).',
    example: '2026-03-10',
  })
  @IsDateString()
  joinDate!: string;

  @ApiPropertyOptional({
    enum: ONBOARDING_STATUSES,
    description: 'Initial onboarding status.',
    example: 'NOT_STARTED',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(ONBOARDING_STATUSES)
  status?: OnboardingStatusValue;

  @ApiPropertyOptional({
    description: 'When onboarding started (ISO date-time).',
    example: '2026-03-11T08:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string | null;

  @ApiPropertyOptional({
    description: 'When onboarding completed (ISO date-time).',
    example: '2026-03-20T17:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string | null;

  @ApiPropertyOptional({
    type: () => [CreateOnboardingChecklistItemDto],
    description: 'Checklist items to attach to the onboarding.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOnboardingChecklistItemDto)
  checklists?: CreateOnboardingChecklistItemDto[];
}

export class UpdateOnboardingChecklistItemDto {
  @ApiProperty({
    description: 'Onboarding task UUID for the checklist item.',
    example: 'task-uuid-1',
  })
  @IsUUID()
  onboardingTaskId!: string;

  @ApiPropertyOptional({
    enum: ONBOARDING_CHECKLIST_STATUSES,
    description: 'Checklist item status.',
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(ONBOARDING_CHECKLIST_STATUSES)
  status?: OnboardingChecklistStatusValue;

  @ApiPropertyOptional({
    description: 'Updated due date for this checklist item.',
    example: '2026-03-16T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateOnboardingDto extends PartialType(CreateOnboardingDto) {
  @ApiPropertyOptional({
    type: () => [UpdateOnboardingChecklistItemDto],
    description:
      'Checklist items to upsert. Items not included are removed from the onboarding.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOnboardingChecklistItemDto)
  checklists?: UpdateOnboardingChecklistItemDto[];
}

// ─── Query DTO ───────────────────────────────────────────────────────────────

export class OnboardingListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by employee UUID.',
    example: 'employee-uuid',
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({
    enum: ONBOARDING_STATUSES,
    description: 'Filter by onboarding status.',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(ONBOARDING_STATUSES)
  status?: OnboardingStatusValue;

  @ApiPropertyOptional({
    description: 'Filter onboarding join date from (YYYY-MM-DD).',
    example: '2026-03-01',
  })
  @IsOptional()
  @IsDateString()
  joinDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter onboarding join date to (YYYY-MM-DD).',
    example: '2026-03-31',
  })
  @IsOptional()
  @IsDateString()
  joinDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by related onboarding task UUID.',
    example: 'task-uuid-1',
  })
  @IsOptional()
  @IsUUID()
  onboardingTaskId?: string;

  @ApiPropertyOptional({
    enum: ONBOARDING_CHECKLIST_STATUSES,
    description: 'Filter by checklist status.',
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(ONBOARDING_CHECKLIST_STATUSES)
  checklistStatus?: OnboardingChecklistStatusValue;

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

// ─── Response DTO ─────────────────────────────────────────────────────────────

export class OnboardingChecklistResponseDto {
  @ApiProperty({ example: 'checklist-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'task-uuid-1' })
  onboardingTaskId!: string;

  @ApiProperty({ example: 'onboarding-uuid-1' })
  onboardingId!: string;

  @ApiProperty({
    enum: ONBOARDING_CHECKLIST_STATUSES,
    example: 'NOT_STARTED',
  })
  status!: OnboardingChecklistStatusValue;

  @ApiPropertyOptional({ example: '2026-03-15T10:00:00.000Z' })
  dueDate!: string | null;

  @ApiProperty({ example: '2026-03-11T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-11T08:00:00.000Z' })
  updatedAt!: string;
}

export class OnboardingResponseDto {
  @ApiProperty({ example: 'onboarding-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'employee-uuid' })
  employeeId!: string;

  @ApiProperty({ enum: ONBOARDING_STATUSES, example: 'NOT_STARTED' })
  status!: OnboardingStatusValue;

  @ApiPropertyOptional({
    example: '2026-03-11T08:00:00.000Z',
    nullable: true,
  })
  startedAt!: string | null;

  @ApiProperty({ example: '2026-03-10' })
  joinDate!: string;

  @ApiPropertyOptional({
    example: '2026-03-20T17:00:00.000Z',
    nullable: true,
  })
  completedAt!: string | null;

  @ApiProperty({ example: '2026-03-11T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-11T08:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: () => [OnboardingChecklistResponseDto] })
  checklists!: OnboardingChecklistResponseDto[];
}
