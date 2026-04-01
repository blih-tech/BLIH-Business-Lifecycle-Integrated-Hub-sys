import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { TaskType, TargetDataModel } from '@repo/database';

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

  @ApiProperty({
    enum: TaskType,
    example: TaskType.NON_CUSTOM,
    description: 'Type of task determining system routing vs ad-hoc.',
  })
  @Transform(normalizeEnumValue)
  @IsEnum(TaskType)
  taskType!: TaskType;

  @ApiPropertyOptional({
    enum: TargetDataModel,
    example: TargetDataModel.EMPLOYEE_ADDRESS,
    description:
      'Required if taskType is NON_CUSTOM to route to the correct data model form.',
  })
  @ValidateIf((o) => o.taskType === TaskType.NON_CUSTOM)
  @IsNotEmpty()
  @Transform(normalizeEnumValue)
  @IsEnum(TargetDataModel)
  targetDataModel?: TargetDataModel;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    description: 'Whether HR verification is required before marked completed.',
  })
  @IsOptional()
  @IsBoolean()
  requiresHrVerification?: boolean;
}

export class UpdateOnboardingTaskDto extends PartialType(
  CreateOnboardingTaskDto,
) {}

// ─── Query DTO ───────────────────────────────────────────────────────────────

export class OnboardingTaskListQueryDto {
  @ApiPropertyOptional({
    enum: TaskType,
    description: 'Filter by task type.',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(TaskType)
  taskType?: TaskType;

  @ApiPropertyOptional({
    enum: TargetDataModel,
    description: 'Filter by target data model.',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(TargetDataModel)
  targetDataModel?: TargetDataModel;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by HR verification requirement.',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  requiresHrVerification?: boolean;

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

  @ApiProperty({ example: 'Set up employee email account' })
  title!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Create a corporate email and configure MFA.',
  })
  description!: string | null;

  @ApiProperty({ enum: TaskType, example: TaskType.NON_CUSTOM })
  taskType!: TaskType;

  @ApiPropertyOptional({
    enum: TargetDataModel,
    nullable: true,
    example: TargetDataModel.EMPLOYEE_ADDRESS,
  })
  targetDataModel!: TargetDataModel | null;

  @ApiProperty({ type: Boolean, example: true })
  requiresHrVerification!: boolean;

  @ApiProperty({ example: '2026-03-11T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-11T14:00:00.000Z' })
  updatedAt!: string;
}
