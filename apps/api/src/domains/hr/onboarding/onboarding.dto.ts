import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;
export type OnboardingStatusValue = (typeof ONBOARDING_STATUSES)[number];

export const ONBOARDING_CHECKLIST_STATUSES = [
  'TODO',
  'SUBMITTED',
  'CHANGES_REQUESTED',
  'COMPLETED',
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

export class CreateOnboardingTaskDto {
  @ApiProperty({
    description: 'Onboarding task UUID mapping the library template.',
    example: 'task-uuid-1',
  })
  @IsUUID()
  taskId!: string;

  @ApiPropertyOptional({
    description: 'Target due date for this task execution.',
    example: '2026-03-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description:
      'If the task must be completed to finalize the employee onboarding status.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

export class CreateOnboardingDto {
  @ApiProperty({
    description: 'Employee UUID for the onboarding record.',
    example: 'employee-uuid',
  })
  @IsUUID()
  employeeId!: string;

  @ApiPropertyOptional({
    enum: ONBOARDING_STATUSES,
    description: 'Initial onboarding status.',
    example: 'IN_PROGRESS',
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
    type: () => [CreateOnboardingTaskDto],
    description: 'Selected tasks deployed from the library into instances.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOnboardingTaskDto)
  tasks?: CreateOnboardingTaskDto[];
}

export class UpdateOnboardingChecklistItemDto {
  @ApiProperty({
    description: 'Task Instance UUID for the checklist item.',
    example: 'task-instance-uuid-1',
  })
  @IsUUID()
  taskInstanceId!: string;

  @ApiPropertyOptional({
    enum: ONBOARDING_CHECKLIST_STATUSES,
    description: 'Checklist item status.',
    example: 'SUBMITTED',
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

export class UpdateOnboardingDto extends PartialType(
  OmitType(CreateOnboardingDto, ['tasks'] as const),
) {
  @ApiPropertyOptional({
    type: () => [UpdateOnboardingChecklistItemDto],
    description:
      'Checklist items to upsert. Items not included are removed from the onboarding.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOnboardingChecklistItemDto)
  tasks?: UpdateOnboardingChecklistItemDto[];
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
    description: 'Filter by related onboarding task instance UUID.',
    example: 'task-instance-uuid-1',
  })
  @IsOptional()
  @IsUUID()
  taskInstanceId?: string;

  @ApiPropertyOptional({
    enum: ONBOARDING_CHECKLIST_STATUSES,
    description: 'Filter by checklist status.',
    example: 'TODO',
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

  @ApiProperty({ example: 'task-instance-uuid-1' })
  taskInstanceId!: string;

  @ApiProperty({ example: 'onboarding-uuid-1' })
  onboardingId!: string;

  @ApiProperty({
    enum: ONBOARDING_CHECKLIST_STATUSES,
    example: 'TODO',
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

  @ApiProperty({ enum: ONBOARDING_STATUSES, example: 'IN_PROGRESS' })
  status!: OnboardingStatusValue;

  @ApiPropertyOptional({
    example: '2026-03-11T08:00:00.000Z',
    nullable: true,
  })
  startedAt!: string | null;

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
