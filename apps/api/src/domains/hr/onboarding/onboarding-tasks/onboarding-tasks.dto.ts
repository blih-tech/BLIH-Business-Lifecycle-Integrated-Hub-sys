import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export const ONBOARDING_TASK_DEPARTMENTS = [
  'HR',
  'IT',
  'ADMIN',
  'TEAM',
] as const;
export type OnboardingTaskDepartmentValue =
  (typeof ONBOARDING_TASK_DEPARTMENTS)[number];

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
    enum: ONBOARDING_TASK_DEPARTMENTS,
    example: 'HR',
    description: 'Department responsible for this onboarding task.',
  })
  @Transform(normalizeEnumValue)
  @IsEnum(ONBOARDING_TASK_DEPARTMENTS)
  department!: OnboardingTaskDepartmentValue;

  @ApiProperty({
    example: 'Set up employee email account',
    description: 'Short title describing the task.',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Create a corporate email and configure MFA.',
    description: 'Optional detailed description of the task.',
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class UpdateOnboardingTaskDto extends PartialType(
  CreateOnboardingTaskDto,
) {}

// ─── Query DTO ───────────────────────────────────────────────────────────────

export class OnboardingTaskListQueryDto {
  @ApiPropertyOptional({
    enum: ONBOARDING_TASK_DEPARTMENTS,
    description: 'Filter by responsible department.',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(ONBOARDING_TASK_DEPARTMENTS)
  department?: OnboardingTaskDepartmentValue;

  @ApiPropertyOptional({
    description: 'Case-insensitive keyword search on title and description.',
    example: 'email',
  })
  @IsOptional()
  @IsString()
  search?: string;

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

export class OnboardingTaskResponseDto {
  @ApiProperty({ example: 'c9a7b3e1-12d4-4f18-b5a6-3f9d2c8e7b01' })
  id!: string;

  @ApiProperty({ enum: ONBOARDING_TASK_DEPARTMENTS, example: 'IT' })
  department!: OnboardingTaskDepartmentValue;

  @ApiProperty({ example: 'Set up employee email account' })
  title!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Create a corporate email and configure MFA.',
  })
  description!: string | null;

  @ApiProperty({
    example: 3,
    description: 'Number of onboarding checklists linked to this task.',
  })
  checklistCount!: number;

  @ApiProperty({ example: '2026-03-11T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-11T14:00:00.000Z' })
  updatedAt!: string;
}
