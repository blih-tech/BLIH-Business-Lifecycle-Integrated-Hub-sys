import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

const ENDORSEMENT_LEVELS = ['STRONG_YES', 'YES', 'UNCERTAIN', 'NO'] as const;
const INTERVIEW_STATUSES = [
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;
const INTERVIEW_TYPES = [
  'HR_SCREENING',
  'TECHNICAL',
  'BEHAVIORAL',
  'PANEL',
  'FINAL',
] as const;

export class CreateInterviewDto {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  @IsUUID()
  applicantId!: string;

  @ApiProperty({ enum: INTERVIEW_TYPES })
  @IsEnum(INTERVIEW_TYPES)
  type!: 'HR_SCREENING' | 'TECHNICAL' | 'BEHAVIORAL' | 'PANEL' | 'FINAL';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  round?: number;

  @ApiPropertyOptional({ enum: INTERVIEW_STATUSES })
  @IsOptional()
  @IsEnum(INTERVIEW_STATUSES)
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  completedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number | null;

  @ApiProperty()
  @IsUUID()
  interviewerId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  meetingUrl?: string | null;

  @ApiPropertyOptional({ nullable: true, type: () => [Object] })
  @IsOptional()
  interviewers?: unknown[] | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  feedback?: string | null;

  @ApiPropertyOptional({ enum: ENDORSEMENT_LEVELS, nullable: true })
  @IsOptional()
  @IsEnum(ENDORSEMENT_LEVELS)
  endorsement?: 'STRONG_YES' | 'YES' | 'UNCERTAIN' | 'NO' | null;

  @ApiPropertyOptional({ nullable: true, example: 4.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  score?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  nextAction?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {}

export class InterviewResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty({ enum: INTERVIEW_TYPES })
  type!: 'HR_SCREENING' | 'TECHNICAL' | 'BEHAVIORAL' | 'PANEL' | 'FINAL';

  @ApiProperty()
  round!: number;

  @ApiProperty({ enum: INTERVIEW_STATUSES })
  status!: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

  @ApiPropertyOptional({ nullable: true })
  scheduledAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  startedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  completedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  durationMinutes!: number | null;

  @ApiPropertyOptional({ nullable: true })
  interviewerId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ nullable: true })
  meetingUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: () => Object })
  interviewers!: unknown;

  @ApiPropertyOptional({ nullable: true })
  feedback!: string | null;

  @ApiPropertyOptional({ nullable: true, enum: ENDORSEMENT_LEVELS })
  endorsement!: 'STRONG_YES' | 'YES' | 'UNCERTAIN' | 'NO' | null;

  @ApiPropertyOptional({ nullable: true })
  score!: string | null;

  @ApiPropertyOptional({ nullable: true })
  nextAction!: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class InterviewListQueryDto {
  @ApiPropertyOptional({ enum: INTERVIEW_STATUSES })
  @IsOptional()
  @IsEnum(INTERVIEW_STATUSES)
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  applicantId?: string;
}
