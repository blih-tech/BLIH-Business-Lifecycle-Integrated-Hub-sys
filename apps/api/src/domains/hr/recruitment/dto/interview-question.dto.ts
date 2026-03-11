import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const INTERVIEW_QUESTION_CATEGORIES = [
  'TECHNICAL',
  'BEHAVIORAL',
  'SITUATIONAL',
  'PROBLEM_SOLVING',
  'LEADERSHIP',
  'COMMUNICATION',
  'DOMAIN_KNOWLEDGE',
  'CULTURAL_FIT',
  'GENERAL',
] as const;

const INTERVIEW_QUESTION_TYPES = [
  'TEXT',
  'TEXTAREA',
  'BOOLEAN',
  'RATING',
  'SINGLE_SELECT',
  'MULTI_SELECT',
] as const;

const normalizeEnumValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;
  return value;
};

export class CreateInterviewQuestionDto {
  @ApiProperty({ example: 'Explain REST API principles' })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    enum: INTERVIEW_QUESTION_CATEGORIES,
    nullable: true,
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(INTERVIEW_QUESTION_CATEGORIES)
  category?: (typeof INTERVIEW_QUESTION_CATEGORIES)[number] | null;

  @ApiProperty({ enum: INTERVIEW_QUESTION_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(INTERVIEW_QUESTION_TYPES)
  type!: (typeof INTERVIEW_QUESTION_TYPES)[number];

  @ApiPropertyOptional({ type: () => [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ nullable: true, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number | null;

  @ApiPropertyOptional({ type: () => [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateInterviewQuestionDto extends PartialType(
  CreateInterviewQuestionDto,
) {}

export class InterviewQuestionListQueryDto {
  @ApiPropertyOptional({ enum: INTERVIEW_QUESTION_CATEGORIES })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(INTERVIEW_QUESTION_CATEGORIES)
  category?: (typeof INTERVIEW_QUESTION_CATEGORIES)[number];

  @ApiPropertyOptional({
    description: 'Comma-separated tags. Returns questions matching any tag.',
    example: 'rest,api,backend',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiPropertyOptional({
    description: 'Defaults to true when omitted.',
    default: true,
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;
}

export class InterviewQuestionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  question!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({
    enum: INTERVIEW_QUESTION_CATEGORIES,
    nullable: true,
  })
  category!: (typeof INTERVIEW_QUESTION_CATEGORIES)[number] | null;

  @ApiProperty({ enum: INTERVIEW_QUESTION_TYPES })
  type!: (typeof INTERVIEW_QUESTION_TYPES)[number];

  @ApiProperty({ type: () => [String] })
  options!: string[];

  @ApiPropertyOptional({ nullable: true })
  difficulty!: number | null;

  @ApiProperty({ type: () => [String] })
  tags!: string[];

  @ApiProperty()
  createdById!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
