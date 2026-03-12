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
  IsBoolean,
  IsDateString,
  IsDefined,
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
import {
  ENDORSEMENT_LEVELS,
  INTERVIEW_ATTENDANCE_STATUSES,
  INTERVIEW_QUESTION_CATEGORIES,
  INTERVIEW_QUESTION_TYPES,
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
} from '@repo/types';
import type {
  CreateInterviewDto as CreateInterviewDtoType,
  InterviewFeedbackResponseDto as InterviewFeedbackResponseDtoType,
  InterviewListQueryDto as InterviewListQueryDtoType,
  InterviewQuestionResponseAnswer,
  InterviewQuestionResponseInputItemDto as InterviewQuestionResponseInputDtoType,
  InterviewQuestionResponseItemDto as InterviewQuestionResponseItemDtoType,
  InterviewResponseAssignmentDto as InterviewResponseAssignmentDtoType,
  InterviewResponseDto as InterviewResponseDtoType,
  InterviewResponseInterviewerDto as InterviewResponseInterviewerDtoType,
  InterviewResponseParticipantApplicantDto as InterviewResponseParticipantApplicantDtoType,
  InterviewResponseParticipantDto as InterviewResponseParticipantDtoType,
  InterviewerAssignmentInputDto as InterviewerAssignmentInputDtoType,
  UpdateInterviewDto as UpdateInterviewDtoType,
  UpdateInterviewParticipantAttendanceDto as UpdateInterviewParticipantAttendanceDtoType,
  UpsertInterviewFeedbackDto as UpsertInterviewFeedbackDtoType,
} from '@repo/types';

export class InterviewQuestionResponseInputDto implements InterviewQuestionResponseInputDtoType {
  @ApiPropertyOptional({
    nullable: true,
    description:
      'Question bank id when response is based on a reusable question. Null for custom questions.',
  })
  @IsOptional()
  @IsUUID()
  questionId?: string | null;

  @ApiProperty({ example: 'Explain REST API principles' })
  @IsString()
  question!: string;

  @ApiPropertyOptional({
    enum: INTERVIEW_QUESTION_CATEGORIES,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(INTERVIEW_QUESTION_CATEGORIES)
  category?: (typeof INTERVIEW_QUESTION_CATEGORIES)[number] | null;

  @ApiProperty({ enum: INTERVIEW_QUESTION_TYPES })
  @IsEnum(INTERVIEW_QUESTION_TYPES)
  type!: (typeof INTERVIEW_QUESTION_TYPES)[number];

  @ApiProperty({
    description:
      'Answer value based on question type (string, boolean, number, string[] or null).',
    nullable: true,
  })
  @IsDefined()
  answer!: InterviewQuestionResponseAnswer;

  @ApiPropertyOptional({ nullable: true, minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  score?: number | null;

  @ApiPropertyOptional({ nullable: true, minimum: 0.01 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  maxScore?: number | null;

  @ApiPropertyOptional({ nullable: true, minimum: 0.01, default: 1 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.01)
  weight?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class InterviewQuestionResponseItemDto implements InterviewQuestionResponseItemDtoType {
  @ApiPropertyOptional({ nullable: true })
  questionId!: string | null;

  @ApiProperty()
  question!: string;

  @ApiPropertyOptional({
    enum: INTERVIEW_QUESTION_CATEGORIES,
    nullable: true,
  })
  category!: (typeof INTERVIEW_QUESTION_CATEGORIES)[number] | null;

  @ApiProperty({ enum: INTERVIEW_QUESTION_TYPES })
  type!: (typeof INTERVIEW_QUESTION_TYPES)[number];

  @ApiProperty({ nullable: true })
  answer!: InterviewQuestionResponseAnswer;

  @ApiPropertyOptional({ nullable: true })
  score!: number | null;

  @ApiPropertyOptional({ nullable: true })
  maxScore!: number | null;

  @ApiPropertyOptional({ nullable: true })
  weight!: number | null;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;
}

export class InterviewerAssignmentInputDto implements InterviewerAssignmentInputDtoType {
  @ApiProperty({ example: 'f8ef7938-8b1e-4a6e-bd25-c61432540273' })
  @IsUUID()
  interviewerId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  role?: string | null;
}

export class CreateInterviewDto implements CreateInterviewDtoType {
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

export class UpdateInterviewDto
  extends PartialType(OmitType(CreateInterviewDto, ['jobId'] as const))
  implements UpdateInterviewDtoType {}

export class UpdateInterviewParticipantAttendanceDto implements UpdateInterviewParticipantAttendanceDtoType {
  @ApiProperty({ enum: INTERVIEW_ATTENDANCE_STATUSES })
  @IsEnum(INTERVIEW_ATTENDANCE_STATUSES)
  attendanceStatus!:
    | 'SCHEDULED'
    | 'ATTENDING'
    | 'NO_SHOW'
    | 'COMPLETED'
    | 'CANCELLED';
}

export class UpsertInterviewFeedbackDto implements UpsertInterviewFeedbackDtoType {
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

  @ApiPropertyOptional({
    type: () => [InterviewQuestionResponseInputDto],
    description:
      'Full replacement payload for per-question responses. Supports bank and custom questions.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewQuestionResponseInputDto)
  questionResponses?: InterviewQuestionResponseInputDto[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({
    default: false,
    description:
      'When true, saves feedback as draft without a submission timestamp.',
  })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}

export class InterviewResponseParticipantApplicantDto implements InterviewResponseParticipantApplicantDtoType {
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

export class InterviewResponseParticipantDto implements InterviewResponseParticipantDtoType {
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

export class InterviewResponseInterviewerDto implements InterviewResponseInterviewerDtoType {
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

export class InterviewResponseAssignmentDto implements InterviewResponseAssignmentDtoType {
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

export class InterviewFeedbackResponseDto implements InterviewFeedbackResponseDtoType {
  @ApiProperty()
  id!: string;

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

  @ApiPropertyOptional({
    type: () => [InterviewQuestionResponseItemDto],
    nullable: true,
  })
  questionResponses!: InterviewQuestionResponseItemDto[] | null;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  isDraft!: boolean;

  @ApiPropertyOptional({ nullable: true })
  submittedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class InterviewResponseDto implements InterviewResponseDtoType {
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

export class InterviewListQueryDto implements InterviewListQueryDtoType {
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
