import { Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
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
const INTERVIEW_ATTENDANCE_STATUSES = [
  'SCHEDULED',
  'ATTENDING',
  'NO_SHOW',
  'COMPLETED',
  'CANCELLED',
] as const;

export class InterviewerAssignmentInputDto {
  @ApiProperty({ example: 'f8ef7938-8b1e-4a6e-bd25-c61432540273' })
  @IsUUID()
  interviewerId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  role?: string | null;
}

export class CreateInterviewDto {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  @IsUUID()
  jobId!: string;

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

  @ApiProperty({ example: '2026-03-10T10:00:00.000Z' })
  @IsDateString()
  scheduledAt!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  meetingUrl?: string | null;

  @ApiProperty({ type: () => [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  applicantIds!: string[];

  @ApiProperty({ type: () => [InterviewerAssignmentInputDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InterviewerAssignmentInputDto)
  interviewers!: InterviewerAssignmentInputDto[];
}

export class UpdateInterviewDto extends PartialType(
  OmitType(CreateInterviewDto, ['jobId'] as const),
) {}

export class UpdateInterviewParticipantAttendanceDto {
  @ApiProperty({ enum: INTERVIEW_ATTENDANCE_STATUSES })
  @IsEnum(INTERVIEW_ATTENDANCE_STATUSES)
  attendanceStatus!:
    | 'SCHEDULED'
    | 'ATTENDING'
    | 'NO_SHOW'
    | 'COMPLETED'
    | 'CANCELLED';
}

export class UpsertInterviewFeedbackDto {
  @ApiPropertyOptional({ nullable: true, example: 82.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  score?: number | null;

  @ApiPropertyOptional({ enum: ENDORSEMENT_LEVELS, nullable: true })
  @IsOptional()
  @IsEnum(ENDORSEMENT_LEVELS)
  endorsement?: 'STRONG_YES' | 'YES' | 'UNCERTAIN' | 'NO' | null;

  @ApiPropertyOptional({ type: () => [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @ApiPropertyOptional({ type: () => [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weaknesses?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class InterviewResponseParticipantApplicantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  status!: string;
}

export class InterviewResponseParticipantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty({ enum: INTERVIEW_ATTENDANCE_STATUSES })
  attendanceStatus!:
    | 'SCHEDULED'
    | 'ATTENDING'
    | 'NO_SHOW'
    | 'COMPLETED'
    | 'CANCELLED';

  @ApiPropertyOptional({
    type: () => InterviewResponseParticipantApplicantDto,
    nullable: true,
  })
  applicant!: InterviewResponseParticipantApplicantDto | null;

  @ApiProperty()
  createdAt!: string;
}

export class InterviewResponseInterviewerDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  status!: string;
}

export class InterviewResponseAssignmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  interviewerId!: string;

  @ApiPropertyOptional({ nullable: true })
  role!: string | null;

  @ApiPropertyOptional({
    type: () => InterviewResponseInterviewerDto,
    nullable: true,
  })
  interviewer!: InterviewResponseInterviewerDto | null;

  @ApiProperty()
  createdAt!: string;
}

export class InterviewFeedbackResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  participantId!: string;

  @ApiProperty()
  assignmentId!: string;

  @ApiPropertyOptional({ nullable: true })
  interviewerId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  score!: number | null;

  @ApiPropertyOptional({ nullable: true, enum: ENDORSEMENT_LEVELS })
  endorsement!: 'STRONG_YES' | 'YES' | 'UNCERTAIN' | 'NO' | null;

  @ApiProperty({ type: () => [String] })
  strengths!: string[];

  @ApiProperty({ type: () => [String] })
  weaknesses!: string[];

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiPropertyOptional({ nullable: true })
  submittedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class InterviewResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  jobId!: string;

  @ApiProperty({ enum: INTERVIEW_TYPES })
  type!: 'HR_SCREENING' | 'TECHNICAL' | 'BEHAVIORAL' | 'PANEL' | 'FINAL';

  @ApiProperty()
  round!: number;

  @ApiProperty({ enum: INTERVIEW_STATUSES })
  status!: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

  @ApiProperty()
  scheduledAt!: string;

  @ApiPropertyOptional({ nullable: true })
  durationMinutes!: number | null;

  @ApiPropertyOptional({ nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ nullable: true })
  meetingUrl!: string | null;

  @ApiProperty()
  createdById!: string;

  @ApiProperty({ type: () => [InterviewResponseParticipantDto] })
  participants!: InterviewResponseParticipantDto[];

  @ApiProperty({ type: () => [InterviewResponseAssignmentDto] })
  interviewers!: InterviewResponseAssignmentDto[];

  @ApiProperty({ type: () => [InterviewFeedbackResponseDto] })
  feedbacks!: InterviewFeedbackResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class InterviewListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({ enum: INTERVIEW_TYPES })
  @IsOptional()
  @IsEnum(INTERVIEW_TYPES)
  type?: 'HR_SCREENING' | 'TECHNICAL' | 'BEHAVIORAL' | 'PANEL' | 'FINAL';

  @ApiPropertyOptional({ enum: INTERVIEW_STATUSES })
  @IsOptional()
  @IsEnum(INTERVIEW_STATUSES)
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  round?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  applicantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  interviewerId?: string;
}
